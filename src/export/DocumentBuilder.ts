import { TFile } from "obsidian";
import type { App } from "obsidian";
import { buildPagedDocument } from "../pagination/buildPagedDocument";
import { renderNote } from "../render/renderNote";
import { marginBoxesCss } from "../running/marginBoxesCss";
import type { RenderSource } from "../render/RenderSource";
import { settingsForNote } from "../settings/loadSettings";
import type { UnderrockSettings } from "../settings/UnderrockSettings";
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
			extraCss: [
				fontFaceCss(this.fontFiles(settings.typography.fontsFolder)),
				typographyCss(settings.typography),
				marginBoxesCss(settings.headerFooter, { title: source.title, date }),
			],
		});
	}

	private fontFiles(folderPath: string): FontFile[] {
		const folder = folderPath.trim() === "" ? null : this.app.vault.getFolderByPath(folderPath.trim());
		if (!folder) return [];
		return folder.children
			.filter((file): file is TFile => file instanceof TFile && FONT_EXTENSIONS.includes(file.extension.toLowerCase()))
			.map((file) => ({ path: file.path, url: this.app.vault.getResourcePath(file) }));
	}
}
