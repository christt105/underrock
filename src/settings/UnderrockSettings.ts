import { DEFAULT_PAGE_SETUP } from "../pagination/PageSetup";
import type { PageSetup } from "../pagination/PageSetup";
import type { LinkMode } from "../render/LinkMode";
import { DEFAULT_TYPOGRAPHY } from "../typography/Typography";
import type { Typography } from "../typography/Typography";
import type { AllowedValues } from "./applyOverrides";

export interface UnderrockSettings {
	page: PageSetup;
	typography: Typography;
	links: LinkMode;
	/** Default document language (BCP 47), used for hyphenation. A note's `lang` frontmatter overrides it. */
	language: string;
}

export const DEFAULT_SETTINGS: UnderrockSettings = {
	page: DEFAULT_PAGE_SETUP,
	typography: DEFAULT_TYPOGRAPHY,
	links: "text",
	language: "en",
};

export const ALLOWED_VALUES: AllowedValues = {
	"page.size": ["A4", "A5", "Letter", "Legal"],
	links: ["text", "obsidian-uri"],
};
