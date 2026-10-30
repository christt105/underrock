import css from "./pagination.css?raw";
import screen from "./screen.css?raw";

/** Page-break rules, processed by Paged.js. */
export const PAGINATION_CSS: string = css;

/** How pages look on screen. Kept apart because Paged.js drops a stylesheet containing `@media screen` entirely. */
export const SCREEN_CSS: string = screen;
