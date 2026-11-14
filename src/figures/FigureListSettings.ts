export interface FigureListSettings {
	/** Whether a list of figures opens the document. */
	readonly enabled: boolean;
	readonly title: string;
}

export const DEFAULT_FIGURE_LIST: FigureListSettings = {
	enabled: false,
	title: "List of figures",
};

export const DEFAULT_TABLE_LIST: FigureListSettings = {
	enabled: false,
	title: "List of tables",
};
