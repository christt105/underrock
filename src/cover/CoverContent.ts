/** What the cover page shows, from the note's frontmatter. */
export interface CoverContent {
	readonly title: string;
	readonly author?: string;
	readonly date: string;
}
