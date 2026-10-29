import { MarkdownView, Notice, Plugin } from "obsidian";
import type { TFile } from "obsidian";
import { HtmlPdfEngine } from "./engines/html/HtmlPdfEngine";
import type { PdfEngine } from "./engines/PdfEngine";
import { DocumentBuilder } from "./export/DocumentBuilder";
import { exportNoteToPdf } from "./export/exportNoteToPdf";
import type { PreviewHost } from "./preview/PreviewHost";
import { PREVIEW_VIEW_TYPE, PreviewView } from "./preview/PreviewView";
import { loadSettings } from "./settings/loadSettings";
import { DEFAULT_SETTINGS } from "./settings/UnderrockSettings";
import type { UnderrockSettings } from "./settings/UnderrockSettings";
import { UnderrockSettingTab } from "./settings/UnderrockSettingTab";

export default class UnderrockPlugin extends Plugin implements PreviewHost {
	override settings: UnderrockSettings = DEFAULT_SETTINGS;
	readonly builder = new DocumentBuilder(this.app, () => this.settings);
	private engine!: PdfEngine;

	override async onload(): Promise<void> {
		this.settings = loadSettings(await this.loadData());
		this.engine = new HtmlPdfEngine(this.app, this.builder, this.scratchDir(), () => this.settings.language);
		this.addSettingTab(new UnderrockSettingTab(this.app, this));
		this.registerView(PREVIEW_VIEW_TYPE, (leaf) => new PreviewView(leaf, this));

		this.addRibbonIcon("file-text", "Open PDF preview", () => void this.openPreview());

		this.addCommand({
			id: "open-preview",
			name: "Open PDF preview",
			callback: () => void this.openPreview(),
		});

		this.addCommand({
			id: "export-pdf",
			name: "Export current note to PDF",
			checkCallback: (checking) => {
				const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
				if (!file) return false;
				if (!checking) void this.exportFile(file);
				return true;
			},
		});

		this.addCommand({
			id: "show-version",
			name: "Show installed version",
			callback: () => {
				new Notice(`Underrock ${this.manifest.version}`);
			},
		});
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		this.refreshPreviews();
	}

	exportFile(file: TFile): Promise<void> {
		return exportNoteToPdf(this.app, this.engine, file);
	}

	private async openPreview(): Promise<void> {
		const existing = this.app.workspace.getLeavesOfType(PREVIEW_VIEW_TYPE)[0];
		if (existing) {
			await this.app.workspace.revealLeaf(existing);
			return;
		}
		const leaf = this.app.workspace.getLeaf("split", "vertical");
		await leaf.setViewState({ type: PREVIEW_VIEW_TYPE, active: false });
	}

	private refreshPreviews(): void {
		for (const leaf of this.app.workspace.getLeavesOfType(PREVIEW_VIEW_TYPE)) {
			if (leaf.view instanceof PreviewView) leaf.view.refresh();
		}
	}

	private scratchDir(): string {
		return this.manifest.dir ?? `${this.app.vault.configDir}/plugins/${this.manifest.id}`;
	}
}
