import { describe, expect, it } from "vitest";
import { loadSettings, settingsForNote } from "./loadSettings";
import { DEFAULT_SETTINGS } from "./UnderrockSettings";

describe("loadSettings", () => {
	it("returns the defaults when nothing is stored", () => {
		expect(loadSettings(null)).toEqual(DEFAULT_SETTINGS);
	});

	it("keeps stored values and fills in missing nested ones", () => {
		const settings = loadSettings({ links: "obsidian-uri", page: { size: "Letter" } });
		expect(settings.links).toBe("obsidian-uri");
		expect(settings.page.size).toBe("Letter");
		expect(settings.page.marginTopMm).toBe(DEFAULT_SETTINGS.page.marginTopMm);
		expect(settings.typography).toEqual(DEFAULT_SETTINGS.typography);
	});
});

describe("settingsForNote", () => {
	it("layers a note's frontmatter over the global settings, which are over the defaults", () => {
		const global = loadSettings({ typography: { bodyFont: "Georgia", bodySize: 12 }, page: { size: "Letter" } });
		const note = settingsForNote(global, { typography: { bodySize: 10, lineHeight: 1.3 }, page: { size: "nonsense" } });
		expect(note.typography.bodyFont).toBe("Georgia");
		expect(note.typography.bodySize).toBe(10);
		expect(note.typography.lineHeight).toBe(1.3);
		expect(note.typography.h1Size).toBe(DEFAULT_SETTINGS.typography.h1Size);
		expect(note.page.size).toBe("Letter");
	});
});
