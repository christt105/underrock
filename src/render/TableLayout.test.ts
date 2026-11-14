import { describe, expect, it } from "vitest";
import { tableLayoutCss } from "./TableLayout";

describe("tableLayoutCss", () => {
	it("leaves centred tables to the document CSS and overrides it for the other layouts", () => {
		expect(tableLayoutCss("center")).toBe("");
		expect(tableLayoutCss("left")).toContain("margin-left: 0;");
		expect(tableLayoutCss("full")).toContain("width: 100%;");
	});
});
