import { PluginSettingTab } from "obsidian";
import type { App, SettingDefinitionItem } from "obsidian";
import type { PageSize } from "../pagination/PageSize";
import type { SettingsHost } from "./SettingsHost";
import { getSettingPath, setSettingPath } from "./settingPath";

const PAGE_SIZES: Record<PageSize, string> = {
	A4: "A4 (210 × 297 mm)",
	A5: "A5 (148 × 210 mm)",
	Letter: "Letter (8.5 × 11 in)",
	Legal: "Legal (8.5 × 14 in)",
};

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
