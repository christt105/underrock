import { ItemView, MarkdownView, debounce, setIcon } from "obsidian";
import type { TFile, WorkspaceLeaf } from "obsidian";
import { sourceFromFile } from "../render/sourceFromFile";
import type { PreviewHost } from "./PreviewHost";
import { waitForPagination } from "./waitForPagination";
import { ZOOM_STEP, clampZoom, fitWidthZoom } from "./zoom";

export const PREVIEW_VIEW_TYPE = "underrock-preview";

const REFRESH_DELAY_MS = 800;

/** Paginated preview of the active note, refreshed as it is edited. */
export class PreviewView extends ItemView {
	private file: TFile | null = null;
	private frame: HTMLIFrameElement | null = null;
	private renderToken = 0;
	private zoom = 1;
	private fitWidth = true;
	private stage!: HTMLElement;
	private status!: HTMLElement;
	private pageLabel!: HTMLElement;
	private zoomLabel!: HTMLElement;
	private readonly scheduleRender = debounce(() => void this.render(), REFRESH_DELAY_MS, true);

	constructor(
		leaf: WorkspaceLeaf,
		private readonly host: PreviewHost,
	) {
		super(leaf);
	}

	getViewType(): string {
		return PREVIEW_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "PDF preview";
	}

	override getIcon(): string {
		return "file-text";
	}

	override async onOpen(): Promise<void> {
		this.contentEl.empty();
		this.contentEl.addClass("underrock-preview");
		this.buildToolbar(this.contentEl.createDiv({ cls: "underrock-preview-toolbar" }));
		this.stage = this.contentEl.createDiv({ cls: "underrock-preview-stage" });
		this.status = this.stage.createDiv({ cls: "underrock-preview-status" });

		this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.followActiveNote()));
		this.registerEvent(
			this.app.workspace.on("file-open", (file) => {
				if (file !== null && file === this.file) this.scheduleRender();
				else this.followActiveNote();
			}),
		);
		this.registerEvent(
			this.app.workspace.on("editor-change", (_editor, info) => {
				if (info.file === this.file) this.scheduleRender();
			}),
		);
		this.registerEvent(
			this.app.vault.on("modify", (file) => {
				if (file === this.file) this.scheduleRender();
			}),
		);
		const resize = new ResizeObserver(() => {
			if (this.fitWidth) this.applyZoom();
		});
		resize.observe(this.stage);
		this.register(() => resize.disconnect());

		this.followActiveNote();
	}

	override async onClose(): Promise<void> {
		this.scheduleRender.cancel();
		this.renderToken++;
	}

	/** Re-renders soon, for example after a settings change. */
	refresh(): void {
		this.scheduleRender();
	}

	private buildToolbar(toolbar: HTMLElement): void {
		this.pageLabel = toolbar.createSpan({ cls: "underrock-preview-pages" });
		toolbar.createDiv({ cls: "underrock-preview-spacer" });
		this.button(toolbar, "zoom-out", "Zoom out", () => this.setZoom(this.zoom - ZOOM_STEP));
		this.zoomLabel = toolbar.createSpan({ cls: "underrock-preview-zoom" });
		this.button(toolbar, "zoom-in", "Zoom in", () => this.setZoom(this.zoom + ZOOM_STEP));
		this.button(toolbar, "move-horizontal", "Fit width", () => {
			this.fitWidth = true;
			this.applyZoom();
		});
		this.button(toolbar, "refresh-cw", "Refresh", () => void this.render());
		this.button(toolbar, "download", "Export to PDF", () => {
			if (this.file) void this.host.exportFile(this.file);
		});
	}

	private button(parent: HTMLElement, icon: string, label: string, onClick: () => void): void {
		const button = parent.createEl("button", { cls: "clickable-icon", attr: { "aria-label": label } });
		setIcon(button, icon);
		button.addEventListener("click", onClick);
	}

	private followActiveNote(): void {
		const active = this.app.workspace.getActiveViewOfType(MarkdownView)?.file ?? this.app.workspace.getActiveFile();
		if (!active || active.extension !== "md" || active === this.file) {
			if (!this.file) this.showStatus("Open a note to preview it.");
			return;
		}
		this.file = active;
		void this.render();
	}

	/** Unsaved editor content if the note is open, so the preview follows typing before autosave. */
	private editorText(file: TFile): string | undefined {
		for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
			const view = leaf.view;
			if (view instanceof MarkdownView && view.file === file) return view.editor.getValue();
		}
		return undefined;
	}

	private async render(): Promise<void> {
		const file = this.file;
		if (!file) return;
		const token = ++this.renderToken;
		if (!this.frame) this.showStatus("Rendering…");
		try {
			const html = await this.host.builder.build(await sourceFromFile(this.app, file, this.editorText(file)));
			if (token !== this.renderToken) return;
			const frame = this.stage.createEl("iframe", { cls: "underrock-preview-frame is-loading" });
			const paginated = waitForPagination(frame);
			frame.srcdoc = html;
			const doc = await paginated;
			if (token !== this.renderToken) {
				frame.remove();
				return;
			}
			this.swapFrame(frame, doc);
		} catch (error) {
			if (token !== this.renderToken) return;
			console.error("Underrock: preview failed", error);
			this.showStatus(`Preview failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private swapFrame(frame: HTMLIFrameElement, doc: Document): void {
		const previous = this.frame;
		const scrollTop = previous?.contentDocument?.scrollingElement?.scrollTop ?? 0;
		this.frame = frame;
		this.applyZoom();
		if (doc.scrollingElement) doc.scrollingElement.scrollTop = scrollTop;
		frame.removeClass("is-loading");
		previous?.remove();
		this.status.hide();
		frame.contentWindow?.addEventListener("scroll", () => this.updatePageLabel(), { passive: true });
		this.updatePageLabel();
	}

	private setZoom(zoom: number): void {
		this.fitWidth = false;
		this.zoom = clampZoom(zoom);
		this.applyZoom();
	}

	private applyZoom(): void {
		const doc = this.frame?.contentDocument;
		if (doc) {
			if (this.fitWidth) {
				const page = doc.querySelector<HTMLElement>(".pagedjs_page");
				this.zoom = fitWidthZoom(this.frame?.clientWidth ?? 0, page?.offsetWidth ?? 0);
			}
			doc.documentElement.style.setProperty("zoom", String(this.zoom));
		}
		this.zoomLabel.setText(`${Math.round(this.zoom * 100)}%`);
		this.updatePageLabel();
	}

	private updatePageLabel(): void {
		const doc = this.frame?.contentDocument;
		const win = this.frame?.contentWindow;
		if (!doc || !win) {
			this.pageLabel.setText("");
			return;
		}
		const total = doc.querySelectorAll(".pagedjs_page").length;
		const page = doc.elementFromPoint(win.innerWidth / 2, win.innerHeight / 2)?.closest(".pagedjs_page");
		const current = page?.getAttribute("data-page-number") ?? "1";
		this.pageLabel.setText(`Page ${current} of ${total}`);
	}

	private showStatus(message: string): void {
		this.status.setText(message);
		this.status.show();
	}
}
