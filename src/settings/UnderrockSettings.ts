import { DEFAULT_FIGURE_LIST } from "../figures/FigureListSettings";
import type { FigureListSettings } from "../figures/FigureListSettings";
import { DEFAULT_PAGE_SETUP } from "../pagination/PageSetup";
import type { PageSetup } from "../pagination/PageSetup";
import type { FootnotePlacement } from "../render/FootnotePlacement";
import type { LinkMode } from "../render/LinkMode";
import { DEFAULT_TABLE_LAYOUT, TABLE_LAYOUTS } from "../render/TableLayout";
import type { TableLayout } from "../render/TableLayout";
import { DEFAULT_HEADER_FOOTER, HORIZONTAL_POSITIONS, MARGIN_SLOTS } from "../running/HeaderFooter";
import type { HeaderFooter } from "../running/HeaderFooter";
import { DEFAULT_TEMPLATE } from "../templates/builtInTemplates";
import { DEFAULT_TOC } from "../toc/TocSettings";
import type { TocSettings } from "../toc/TocSettings";
import { DEFAULT_TYPOGRAPHY, TEXT_ALIGNS } from "../typography/Typography";
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
	/** Whether the document opens with a title page. */
	cover: boolean;
	toc: TocSettings;
	/** Whether the PDF gets a bookmark for each heading. */
	bookmarks: boolean;
	figureList: FigureListSettings;
	links: LinkMode;
	footnotes: FootnotePlacement;
	tables: TableLayout;
	/** Default document language (BCP 47), used for hyphenation. A note's `lang` frontmatter overrides it. */
	language: string;
}

export const DEFAULT_SETTINGS: UnderrockSettings = {
	template: DEFAULT_TEMPLATE,
	templatesFolder: "",
	page: DEFAULT_PAGE_SETUP,
	typography: DEFAULT_TYPOGRAPHY,
	headerFooter: DEFAULT_HEADER_FOOTER,
	cover: false,
	toc: DEFAULT_TOC,
	bookmarks: true,
	figureList: DEFAULT_FIGURE_LIST,
	links: "text",
	footnotes: "page",
	tables: DEFAULT_TABLE_LAYOUT,
	language: "en",
};

export const ALLOWED_VALUES: AllowedValues = {
	"page.size": ["A4", "A5", "Letter", "Legal"],
	links: ["text", "obsidian-uri"],
	footnotes: ["page", "end"],
	tables: TABLE_LAYOUTS,
	"typography.textAlign": TEXT_ALIGNS,
	"headerFooter.pageNumberPosition": MARGIN_SLOTS,
	"headerFooter.headerPosition": HORIZONTAL_POSITIONS,
	"headerFooter.footerPosition": HORIZONTAL_POSITIONS,
};
