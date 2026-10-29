/** A note handed to the render pipeline. */
export interface RenderSource {
	/** Vault path of the note, used to resolve links and embeds. */
	readonly path: string;
	readonly markdown: string;
}
