import { DEFAULT_PAGE_SETUP } from "../pagination/PageSetup";
import type { PageSetup } from "../pagination/PageSetup";
import type { LinkMode } from "../render/LinkMode";

export interface UnderrockSettings {
	page: PageSetup;
	links: LinkMode;
	/** Default document language (BCP 47), used for hyphenation. A note's `lang` frontmatter overrides it. */
	language: string;
}

export const DEFAULT_SETTINGS: UnderrockSettings = {
	page: DEFAULT_PAGE_SETUP,
	links: "text",
	language: "en",
};
