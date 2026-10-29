import { Platform } from "obsidian";
import type { App } from "obsidian";
import type { DocumentBuilder } from "../../export/DocumentBuilder";
import { setPdfMetadata } from "../../pdf/setPdfMetadata";
import type { RenderSource } from "../../render/RenderSource";
import type { PdfEngine } from "../PdfEngine";
import { printHtmlToPdf } from "./printHtmlToPdf";

/** Renders with Obsidian, paginates with Paged.js and prints with Electron. Desktop only. */
export class HtmlPdfEngine implements PdfEngine {
	readonly id = "html";

	constructor(
		private readonly app: App,
		private readonly builder: DocumentBuilder,
		private readonly scratchDir: string,
	) {}

	isAvailable(): boolean {
		return Platform.isDesktopApp;
	}

	async render(source: RenderSource): Promise<Uint8Array> {
		const html = await this.builder.build(source);
		const pdf = await printHtmlToPdf(this.app.vault.adapter, this.scratchDir, html);
		const language = source.lang ?? this.builder.settingsFor(source).language;
		return setPdfMetadata(pdf, { title: source.title, author: source.author, language });
	}
}
