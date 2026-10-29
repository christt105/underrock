import type { PageSize } from "./PageSize";

export interface PageSetup {
	readonly size: PageSize;
	readonly landscape: boolean;
	readonly marginTopMm: number;
	readonly marginRightMm: number;
	readonly marginBottomMm: number;
	readonly marginLeftMm: number;
}

export const DEFAULT_PAGE_SETUP: PageSetup = {
	size: "A4",
	landscape: false,
	marginTopMm: 25,
	marginRightMm: 22,
	marginBottomMm: 25,
	marginLeftMm: 22,
};
