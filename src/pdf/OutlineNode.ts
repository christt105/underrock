import type { PDFRef } from "pdf-lib";
import type { HeadingPosition } from "./HeadingPosition";

/** An entry of the PDF outline tree while it is being built. */
export interface OutlineNode {
	readonly level: number;
	readonly ref: PDFRef;
	readonly heading?: HeadingPosition;
	readonly children: OutlineNode[];
}
