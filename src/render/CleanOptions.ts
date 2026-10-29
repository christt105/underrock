import type { LinkMode } from "./LinkMode";

export interface CleanOptions {
	readonly links: LinkMode;
	/** Needed to build `obsidian://` links. */
	readonly vaultName: string;
}
