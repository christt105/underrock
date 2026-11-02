/** A numbered figure in a note, for the list of figures and links to it. */
export interface FigureEntry {
	/** Id of the figure element. */
	readonly id: string;
	/** Its number with the word before it, like "Figure 3". */
	readonly label: string;
	/** Text of its caption after the label, empty if it has none. */
	readonly caption: string;
	/** Its block id, like `chart` for `^chart`, empty if it has none. */
	readonly blockId: string;
}
