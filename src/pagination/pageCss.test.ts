import { describe, expect, it } from "vitest";
import { DEFAULT_PAGE_SETUP } from "./PageSetup";
import { pageCss } from "./pageCss";

describe("pageCss", () => {
	it("writes size, orientation and margins", () => {
		const css = pageCss({ ...DEFAULT_PAGE_SETUP, size: "Letter", landscape: true, marginLeftMm: 30 });
		expect(css).toContain("size: Letter landscape;");
		expect(css).toContain("margin: 25mm 22mm 25mm 30mm;");
	});

	it("clamps negative margins to zero", () => {
		expect(pageCss({ ...DEFAULT_PAGE_SETUP, marginTopMm: -5 })).toContain("margin: 0mm");
	});
});
