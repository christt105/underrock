export const TABLE_LAYOUTS = ["left", "center", "full"] as const;

/** How tables sit on the page: at their own width on the left or centred, or across the text width. */
export type TableLayout = (typeof TABLE_LAYOUTS)[number];

export const DEFAULT_TABLE_LAYOUT: TableLayout = "center";

/**
 * CSS for a table layout other than the default, which the document's own CSS sets, so a template's
 * tables apply until the user picks another layout.
 */
export function tableLayoutCss(layout: TableLayout): string {
	switch (layout) {
		case "left":
			return "table {\n\tmargin-left: 0;\n\tmargin-right: auto;\n}\n";
		case "full":
			return "table {\n\twidth: 100%;\n}\n";
		default:
			return "";
	}
}
