/** A note handed to the render pipeline. */
export interface RenderSource {
	/** Vault path of the note, used to resolve links and embeds. */
	readonly path: string;
	readonly title: string;
	readonly author?: string;
	/** Language from the note's frontmatter, for hyphenation. */
	readonly lang?: string;
	readonly markdown: string;
}
