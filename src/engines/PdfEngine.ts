import type { RenderSource } from "../render/RenderSource";

/** Turns a note into a PDF. Each backend (HTML with Paged.js, Typst, ...) implements this. */
export interface PdfEngine {
	readonly id: string;
	/** Whether the engine can run on the current platform. */
	isAvailable(): boolean;
	render(source: RenderSource): Promise<ArrayBuffer>;
}
