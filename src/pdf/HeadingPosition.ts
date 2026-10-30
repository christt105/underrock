/** Where a heading landed in the paginated document, in CSS pixels from the top of its page. */
export interface HeadingPosition {
	readonly level: number;
	readonly title: string;
	readonly pageIndex: number;
	readonly top: number;
	readonly pageHeight: number;
}
