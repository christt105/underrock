import type { HeadingPosition } from "../../pdf/HeadingPosition";

/** A printed PDF and where its headings landed. */
export interface PrintedDocument {
	readonly pdf: Uint8Array;
	readonly headings: readonly HeadingPosition[];
}
