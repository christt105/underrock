import { describe, expect, it } from "vitest";
import { getSettingPath, setSettingPath } from "./settingPath";

const SETTINGS = { language: "en", page: { size: "A4", marginTopMm: 25 } };

describe("getSettingPath", () => {
	it("reads top-level and nested keys", () => {
		expect(getSettingPath(SETTINGS, "language")).toBe("en");
		expect(getSettingPath(SETTINGS, "page.size")).toBe("A4");
		expect(getSettingPath(SETTINGS, "page.missing.deeper")).toBeUndefined();
	});
});

describe("setSettingPath", () => {
	it("writes nested keys without mutating the original", () => {
		const updated = setSettingPath(SETTINGS, "page.marginTopMm", 30);
		expect(updated.page).toEqual({ size: "A4", marginTopMm: 30 });
		expect(SETTINGS.page.marginTopMm).toBe(25);
	});

	it("ignores keys that don't exist", () => {
		expect(setSettingPath(SETTINGS, "nope.size", 1)).toBe(SETTINGS);
	});
});
