import { PDFDocument } from "pdf-lib";
import { addPdfOutline } from "./addPdfOutline";
import type { HeadingPosition } from "./HeadingPosition";
import type { PdfMetadata } from "./PdfMetadata";
import { setPdfMetadata } from "./setPdfMetadata";

/** Adds metadata and, given heading positions, bookmarks to a printed PDF. */
export async function finishPdf(pdf: Uint8Array, metadata: PdfMetadata, bookmarks: readonly HeadingPosition[]): Promise<Uint8Array> {
	const doc = await PDFDocument.load(pdf, { updateMetadata: false });
	setPdfMetadata(doc, metadata);
	addPdfOutline(doc, bookmarks);
	return doc.save();
}
