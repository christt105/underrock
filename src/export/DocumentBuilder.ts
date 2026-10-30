import { TFile } from "obsidian";
import type { App } from "obsidian";
import { coverHtml } from "../cover/coverHtml";
import { absoluteCssUrls } from "../pagination/absoluteCssUrls";
import { buildPagedDocument } from "../pagination/buildPagedDocument";
import { renderNote } from "../render/renderNote";
import { marginBoxesCss } from "../running/marginBoxesCss";
import type { RenderSource } from "../render/RenderSource";
import { settingsForNote } from "../settings/loadSettings";
import type { UnderrockSettings } from "../settings/UnderrockSettings";
import { BUILT_IN_TEMPLATES } from "../templates/builtInTemplates";
import { userTemplateFiles } from "../templates/userTemplateFiles";
import { tocHtml } from "../toc/tocHtml";
import type { FontFile } from "../typography/FontFile";
import { FONT_EXTENSIONS, fontFaceCss } from "../typography/fontFaceCss";
import { typographyCss } from "../typography/typographyCss";

/** Turns a note into the self-paginating HTML document shared by the preview and the HTML engine. */
export class DocumentBuilder {
	constructor(
		private readonly app: App,
		private readonly settings: () => UnderrockSettings,
	) {}

	/** The settings that apply to a note, with its frontmatter overrides. */
	settingsFor(source: RenderSource): UnderrockSettings {
		return settingsForNote(this.settings(), source.overrides);
	}

	async build(source: RenderSource): Promise<string> {
		const settings = this.settingsFor(source);
		const lang = source.lang ?? settings.language;
		const note = await renderNote(this.app, source, { links: settings.links, vaultName: this.app.vault.getName() });
		const date = source.date ?? new Date().toLocaleDateString(lang, { year: "numeric", month: "long", day: "numeric" });
		return buildPagedDocument(note, {
			page: settings.page,
			lang,
			baseUrl: activeDocument.baseURI,
			leadingHtml: [
				settings.cover ? coverHtml({ title: source.title, author: source.author, date }) : "",
				settings.toc.enabled ? tocHtml(note.headings, settings.toc) : "",
			],
			extraCss: [
				fontFaceCss(this.fontFiles(settings.typography.fontsFolder)),
				await this.templateCss(settings),
				typographyCss(settings.typography),
				marginBoxesCss(settings.headerFooter, { title: source.title, date }),
			],
		});
	}

	/** The chosen template's CSS: a user template of that name if there is one, else a built-in one, else none. */
	private async templateCss(settings: UnderrockSettings): Promise<string> {
		const name = settings.template.trim();
		const file = userTemplateFiles(this.app, settings.templatesFolder).find((f) => f.basename === name);
		if (file) return absoluteCssUrls(await this.app.vault.cachedRead(file), this.app.vault.getResourcePath(file));
		return BUILT_IN_TEMPLATES.get(name) ?? "";
	}

	private fontFiles(folderPath: string): FontFile[] {
		const folder = folderPath.trim() === "" ? null : this.app.vault.getFolderByPath(folderPath.trim());
		if (!folder) return [];
		return folder.children
			.filter((file): file is TFile => file instanceof TFile && FONT_EXTENSIONS.includes(file.extension.toLowerCase()))
			.map((file) => ({ path: file.path, url: this.app.vault.getResourcePath(file) }));
	}
}
