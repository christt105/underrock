import type { LinkMode } from "./LinkMode";

export interface CleanOptions {
	readonly links: LinkMode;
	/** Needed to build `obsidian://` links. */
	readonly vaultName: string;
	/** Document language (BCP 47), which picks the word in figure captions. */
	readonly lang: string;
	/** Vault paths of the notes included in the document, whose links become links within it. */
	readonly includedNotes?: readonly string[];
}
