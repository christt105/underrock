import type { PDFDocument } from "pdf-lib";
import type { PdfMetadata } from "./PdfMetadata";

/** Writes document information (title, author, language) into a PDF. */
export function setPdfMetadata(doc: PDFDocument, metadata: PdfMetadata): void {
	doc.setTitle(metadata.title, { showInWindowTitleBar: true });
	if (metadata.author !== undefined) doc.setAuthor(metadata.author);
	doc.setLanguage(metadata.language);
	doc.setCreator("Underrock");
	doc.setProducer("Underrock");
}
