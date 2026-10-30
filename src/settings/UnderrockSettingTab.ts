import { PluginSettingTab } from "obsidian";
import type { App, SettingDefinitionItem } from "obsidian";
import type { PageSize } from "../pagination/PageSize";
import type { HorizontalPosition, MarginSlot } from "../running/MarginSlot";
import type { SettingsHost } from "./SettingsHost";
import { getSettingPath, setSettingPath } from "./settingPath";

const PAGE_SIZES: Record<PageSize, string> = {
	A4: "A4 (210 × 297 mm)",
	A5: "A5 (148 × 210 mm)",
	Letter: "Letter (8.5 × 11 in)",
	Legal: "Legal (8.5 × 14 in)",
};

const MARGIN_SLOT_NAMES: Record<MarginSlot, string> = {
	"top-left": "Top left",
	"top-center": "Top centre",
	"top-right": "Top right",
	"bottom-left": "Bottom left",
	"bottom-center": "Bottom centre",
	"bottom-right": "Bottom right",
};

const POSITION_NAMES: Record<HorizontalPosition, string> = { left: "Left", center: "Centre", right: "Right" };

const HEADING_SIZES: [string, string][] = [1, 2, 3, 4, 5, 6].map((level) => [`typography.h${level}Size`, `Heading ${level} size`]);

const MARGINS: [string, string][] = [
	["page.marginTopMm", "Top margin"],
	["page.marginBottomMm", "Bottom margin"],
	["page.marginLeftMm", "Left margin"],
	["page.marginRightMm", "Right margin"],
];

export class UnderrockSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private readonly host: SettingsHost,
	) {
		super(app, host);
	}

	override getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				type: "group",
				heading: "Page",
				items: [
					{ name: "Page size", control: { type: "dropdown", key: "page.size", options: PAGE_SIZES } },
					{ name: "Landscape", control: { type: "toggle", key: "page.landscape" } },
					...MARGINS.map(([key, name]) => ({
						name,
						desc: "In millimetres.",
						control: { type: "number" as const, key, min: 0, step: 1 },
					})),
				],
			},
			{
				type: "group",
				heading: "Typography",
				items: [
					{
						name: "Body font",
						desc: "Font name, or several separated by commas. Leave empty for the default serif.",
						control: { type: "text", key: "typography.bodyFont", placeholder: "Charter, Georgia, serif" },
					},
					{
						name: "Heading font",
						desc: "Leave empty to use the body font.",
						control: { type: "text", key: "typography.headingFont" },
					},
					{
						name: "Code font",
						control: { type: "text", key: "typography.codeFont", placeholder: "JetBrains Mono, monospace" },
					},
					{
						name: "Fonts folder",
						desc: "Font files in this folder (TTF, OTF, WOFF, WOFF2) can be used by name. Name them Family-Style, like Inter-Bold.ttf.",
						control: { type: "folder", key: "typography.fontsFolder" },
					},
					{
						name: "Body size",
						desc: "In points.",
						control: { type: "number", key: "typography.bodySize", min: 6, max: 72, step: 0.5 },
					},
					...HEADING_SIZES.map(([key, name]) => ({
						name,
						desc: "In points.",
						control: { type: "number" as const, key, min: 6, max: 96, step: 0.5 },
					})),
					{
						name: "Line height",
						desc: "Multiple of the font size.",
						control: { type: "number", key: "typography.lineHeight", min: 1, max: 3, step: 0.05 },
					},
					{ name: "Text colour", control: { type: "color", key: "typography.textColor" } },
					{ name: "Heading colour", control: { type: "color", key: "typography.headingColor" } },
				],
			},
			{
				type: "group",
				heading: "Page numbers, header and footer",
				items: [
					{ name: "Page numbers", control: { type: "toggle", key: "headerFooter.pageNumbers" } },
					{
						name: "Page number position",
						control: { type: "dropdown", key: "headerFooter.pageNumberPosition", options: MARGIN_SLOT_NAMES },
					},
					{
						name: "Page number format",
						desc: "Use {page} and {pages}, such as {page} / {pages}.",
						control: { type: "text", key: "headerFooter.pageNumberFormat", placeholder: "{page}" },
					},
					{
						name: "Header",
						desc: "Text at the top of each page. Can use {title}, {date}, {section}, {page} and {pages}.",
						control: { type: "text", key: "headerFooter.header" },
					},
					{
						name: "Header position",
						control: { type: "dropdown", key: "headerFooter.headerPosition", options: POSITION_NAMES },
					},
					{
						name: "Footer",
						desc: "Text at the bottom of each page, with the same variables as the header.",
						control: { type: "text", key: "headerFooter.footer" },
					},
					{
						name: "Footer position",
						control: { type: "dropdown", key: "headerFooter.footerPosition", options: POSITION_NAMES },
					},
					{
						name: "Number the first page",
						desc: "Turn off to leave the first page without page number, header or footer.",
						control: { type: "toggle", key: "headerFooter.onFirstPage" },
					},
				],
			},
			{
				type: "group",
				heading: "Contents and bookmarks",
				items: [
					{
						name: "Table of contents",
						desc: "Adds a page before the note that lists its headings with their page numbers.",
						control: { type: "toggle", key: "toc.enabled" },
					},
					{
						name: "Contents depth",
						desc: "Deepest heading level listed, from 1 to 6.",
						control: { type: "number", key: "toc.depth", min: 1, max: 6, step: 1 },
					},
					{ name: "Contents title", control: { type: "text", key: "toc.title", placeholder: "Contents" } },
					{
						name: "PDF bookmarks",
						desc: "Adds a bookmark for each heading to the exported PDF.",
						control: { type: "toggle", key: "bookmarks" },
					},
				],
			},
			{
				type: "group",
				heading: "Content",
				items: [
					{
						name: "Language",
						desc: "Language code used for hyphenation, such as en or es. A note's lang property overrides it.",
						control: { type: "text", key: "language", placeholder: "en" },
					},
					{
						name: "Links to other notes",
						desc: "Links within the same note always stay clickable.",
						control: {
							type: "dropdown",
							key: "links",
							options: { text: "Plain text", "obsidian-uri": "Open the note in Obsidian" },
						},
					},
				],
			},
		];
	}

	override getControlValue(key: string): unknown {
		return getSettingPath(this.host.settings, key);
	}

	override async setControlValue(key: string, value: unknown): Promise<void> {
		if (typeof value === "number" && (!Number.isFinite(value) || value < 0)) return;
		if (key === "language" && typeof value === "string") value = value.trim() === "" ? "en" : value.trim();
		this.host.settings = setSettingPath(this.host.settings, key, value);
		await this.host.saveSettings();
	}
}
