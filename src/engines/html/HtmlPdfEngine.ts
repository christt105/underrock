import { Platform } from "obsidian";
import type { DocumentBuilder } from "../../export/DocumentBuilder";
import { finishPdf } from "../../pdf/finishPdf";
import type { RenderSource } from "../../render/RenderSource";
import type { PdfEngine } from "../PdfEngine";
import { printHtmlToPdf } from "./printHtmlToPdf";

/** Renders with Obsidian, paginates with Paged.js and prints with Electron. Desktop only. */
export class HtmlPdfEngine implements PdfEngine {
	readonly id = "html";

	constructor(private readonly builder: DocumentBuilder) {}

	isAvailable(): boolean {
		return Platform.isDesktopApp;
	}

	async render(source: RenderSource): Promise<Uint8Array> {
		const html = await this.builder.build(source);
		const { pdf, headings } = await printHtmlToPdf(html);
		const settings = this.builder.settingsFor(source);
		const language = source.lang ?? settings.language;
		return finishPdf(pdf, { title: source.title, author: source.author, language }, settings.bookmarks ? headings : []);
	}
}
