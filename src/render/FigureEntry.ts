/** A numbered figure in a note, for the list of figures and links to it. */
export interface FigureEntry {
	/** Id of the figure element. */
	readonly id: string;
	/** Its number with the word before it, like "Figure 3". */
	readonly label: string;
	/**
	 * Its description: the line below its images, or a single image's alt text. Unlike the caption it
	 * leaves out the (a), (b)… text of images side by side. Empty if it has none.
	 */
	readonly description: string;
	/** Its block id, like `chart` for `^chart`, empty if it has none. */
	readonly blockId: string;
}
