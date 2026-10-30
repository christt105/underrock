import type { App } from "obsidian";
import { buildPagedDocument } from "../pagination/buildPagedDocument";
import { renderNote } from "../render/renderNote";
import type { RenderSource } from "../render/RenderSource";
import type { UnderrockSettings } from "../settings/UnderrockSettings";

/** Turns a note into the self-paginating HTML document shared by the preview and the HTML engine. */
export class DocumentBuilder {
	constructor(
		private readonly app: App,
		private readonly settings: () => UnderrockSettings,
	) {}

	async build(source: RenderSource): Promise<string> {
		const settings = this.settings();
		const note = await renderNote(this.app, source, { links: settings.links, vaultName: this.app.vault.getName() });
		return buildPagedDocument(note, {
			page: settings.page,
			lang: source.lang ?? settings.language,
			baseUrl: activeDocument.baseURI,
			extraCss: [],
		});
	}
}
