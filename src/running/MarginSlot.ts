export type HorizontalPosition = "left" | "center" | "right";

/** A page margin box, as in CSS `@top-center` or `@bottom-right`. */
export type MarginSlot = `${"top" | "bottom"}-${HorizontalPosition}`;
