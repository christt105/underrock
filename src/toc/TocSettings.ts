export interface TocSettings {
	/** Whether a table of contents opens the document. */
	readonly enabled: boolean;
	/** Deepest heading level listed, from 1 to 6. */
	readonly depth: number;
	readonly title: string;
}

export const DEFAULT_TOC: TocSettings = {
	enabled: false,
	depth: 3,
	title: "Contents",
};
