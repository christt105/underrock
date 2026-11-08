import type { FootnotePlacement } from "./FootnotePlacement";
import type { LinkMode } from "./LinkMode";

export interface CleanOptions {
	readonly links: LinkMode;
	readonly footnotes: FootnotePlacement;
	/** Needed to build `obsidian://` links. */
	readonly vaultName: string;
	/** Document language (BCP 47), which picks the word in figure captions. */
	readonly lang: string;
}
