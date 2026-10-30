/** A note rendered to self-contained HTML, ready to be placed in a document. */
export interface RenderedNote {
	readonly title: string;
	readonly html: string;
	/** Stylesheet MathJax generated for the formulas in the note. */
	readonly mathCss: string;
}
