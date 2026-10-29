import { describe, expect, it } from "vitest";
import { MAX_ZOOM, MIN_ZOOM, clampZoom, fitWidthZoom } from "./zoom";

describe("clampZoom", () => {
	it("keeps zoom within bounds and rounds it to whole percents", () => {
		expect(clampZoom(10)).toBe(MAX_ZOOM);
		expect(clampZoom(0)).toBe(MIN_ZOOM);
		expect(clampZoom(1.1 + 0.1)).toBe(1.2);
	});
});

describe("fitWidthZoom", () => {
	it("scales the page to the available width minus gutters", () => {
		expect(fitWidthZoom(432, 800)).toBe(0.5);
		expect(fitWidthZoom(1632, 800)).toBe(2);
	});

	it("falls back to 100% for an unknown page width", () => {
		expect(fitWidthZoom(500, 0)).toBe(1);
	});
});
