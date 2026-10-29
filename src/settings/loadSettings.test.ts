import { describe, expect, it } from "vitest";
import { loadSettings } from "./loadSettings";
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
	});
});
