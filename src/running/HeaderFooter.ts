import type { HorizontalPosition, MarginSlot } from "./MarginSlot";

/** Text in the page margins. Templates accept {page}, {pages}, {title}, {date} and {section}. */
export interface HeaderFooter {
	readonly pageNumbers: boolean;
	readonly pageNumberPosition: MarginSlot;
	readonly pageNumberFormat: string;
	readonly header: string;
	readonly headerPosition: HorizontalPosition;
	readonly footer: string;
	readonly footerPosition: HorizontalPosition;
	/** Whether the first page gets the page number, header and footer too. */
	readonly onFirstPage: boolean;
}

export const DEFAULT_HEADER_FOOTER: HeaderFooter = {
	pageNumbers: true,
	pageNumberPosition: "bottom-center",
	pageNumberFormat: "{page}",
	header: "",
	headerPosition: "right",
	footer: "",
	footerPosition: "left",
	onFirstPage: true,
};

export const MARGIN_SLOTS: readonly MarginSlot[] = [
	"top-left",
	"top-center",
	"top-right",
	"bottom-left",
	"bottom-center",
	"bottom-right",
];

export const HORIZONTAL_POSITIONS: readonly HorizontalPosition[] = ["left", "center", "right"];
