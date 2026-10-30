import { DEFAULT_PAGE_SETUP } from "../pagination/PageSetup";
import type { PageSetup } from "../pagination/PageSetup";
import type { LinkMode } from "../render/LinkMode";
import { DEFAULT_HEADER_FOOTER, HORIZONTAL_POSITIONS, MARGIN_SLOTS } from "../running/HeaderFooter";
import type { HeaderFooter } from "../running/HeaderFooter";
import { DEFAULT_TEMPLATE } from "../templates/builtInTemplates";
import { DEFAULT_TOC } from "../toc/TocSettings";
import type { TocSettings } from "../toc/TocSettings";
import { DEFAULT_TYPOGRAPHY } from "../typography/Typography";
import type { Typography } from "../typography/Typography";
import type { AllowedValues } from "./applyOverrides";

export interface UnderrockSettings {
	/** Name of a built-in template, or of a CSS file in the templates folder. */
	template: string;
	/** Vault folder whose CSS files are user templates. */
	templatesFolder: string;
	page: PageSetup;
	typography: Typography;
	headerFooter: HeaderFooter;
	toc: TocSettings;
	/** Whether the PDF gets a bookmark for each heading. */
	bookmarks: boolean;
	links: LinkMode;
	/** Default document language (BCP 47), used for hyphenation. A note's `lang` frontmatter overrides it. */
	language: string;
}

export const DEFAULT_SETTINGS: UnderrockSettings = {
	template: DEFAULT_TEMPLATE,
	templatesFolder: "",
	page: DEFAULT_PAGE_SETUP,
	typography: DEFAULT_TYPOGRAPHY,
	headerFooter: DEFAULT_HEADER_FOOTER,
	toc: DEFAULT_TOC,
	bookmarks: true,
	links: "text",
	language: "en",
};

export const ALLOWED_VALUES: AllowedValues = {
	"page.size": ["A4", "A5", "Letter", "Legal"],
	links: ["text", "obsidian-uri"],
	"headerFooter.pageNumberPosition": MARGIN_SLOTS,
	"headerFooter.headerPosition": HORIZONTAL_POSITIONS,
	"headerFooter.footerPosition": HORIZONTAL_POSITIONS,
};
