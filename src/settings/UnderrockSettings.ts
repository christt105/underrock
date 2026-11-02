import { DEFAULT_FIGURE_LIST } from "../figures/FigureListSettings";
import type { FigureListSettings } from "../figures/FigureListSettings";
import { DEFAULT_PAGE_SETUP } from "../pagination/PageSetup";
import type { PageSetup } from "../pagination/PageSetup";
import type { LinkMode } from "../render/LinkMode";
import { DEFAULT_HEADER_FOOTER, HORIZONTAL_POSITIONS, MARGIN_SLOTS } from "../running/HeaderFooter";
import type { HeaderFooter } from "../running/HeaderFooter";
import { DEFAULT_TYPOGRAPHY, TEXT_ALIGNS } from "../typography/Typography";
import type { Typography } from "../typography/Typography";
import type { AllowedValues } from "./applyOverrides";

export interface UnderrockSettings {
	page: PageSetup;
	typography: Typography;
	headerFooter: HeaderFooter;
	figureList: FigureListSettings;
	links: LinkMode;
	/** Default document language (BCP 47), used for hyphenation. A note's `lang` frontmatter overrides it. */
	language: string;
}

export const DEFAULT_SETTINGS: UnderrockSettings = {
	page: DEFAULT_PAGE_SETUP,
	typography: DEFAULT_TYPOGRAPHY,
	headerFooter: DEFAULT_HEADER_FOOTER,
	figureList: DEFAULT_FIGURE_LIST,
	links: "text",
	language: "en",
};

export const ALLOWED_VALUES: AllowedValues = {
	"page.size": ["A4", "A5", "Letter", "Legal"],
	links: ["text", "obsidian-uri"],
	"typography.textAlign": TEXT_ALIGNS,
	"headerFooter.pageNumberPosition": MARGIN_SLOTS,
	"headerFooter.headerPosition": HORIZONTAL_POSITIONS,
	"headerFooter.footerPosition": HORIZONTAL_POSITIONS,
};
