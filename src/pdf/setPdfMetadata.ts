import { PDFDocument } from "pdf-lib";
import type { PdfMetadata } from "./PdfMetadata";

/** Writes document information (title, author, language) into a PDF. */
export async function setPdfMetadata(pdf: Uint8Array, metadata: PdfMetadata): Promise<Uint8Array> {
	const doc = await PDFDocument.load(pdf, { updateMetadata: false });
	doc.setTitle(metadata.title, { showInWindowTitleBar: true });
	if (metadata.author !== undefined) doc.setAuthor(metadata.author);
	doc.setLanguage(metadata.language);
	doc.setCreator("Underrock");
	doc.setProducer("Underrock");
	return doc.save();
}
