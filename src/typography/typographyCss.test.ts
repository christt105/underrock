import { describe, expect, it } from "vitest";
import { DEFAULT_TYPOGRAPHY } from "./Typography";
import { fontFamily, typographyCss } from "./typographyCss";

describe("typographyCss", () => {
	it("writes sizes, line height and colours as CSS variables", () => {
		const css = typographyCss({ ...DEFAULT_TYPOGRAPHY, bodySize: 12, h2Size: 18, lineHeight: 1.4, headingColor: "#336699" });
		expect(css).toContain("--ur-size-body: 12pt;");
		expect(css).toContain("--ur-size-h2: 18pt;");
		expect(css).toContain("--ur-line-height: 1.4;");
		expect(css).toContain("--ur-color-heading: #336699;");
	});

	it("leaves default fonts alone and skips invalid colours", () => {
		const css = typographyCss({ ...DEFAULT_TYPOGRAPHY, textColor: "red; background: url(x)" });
		expect(css).not.toContain("--ur-font-body");
		expect(css).not.toContain("--ur-color-text");
	});

	it("leaves settings at their default to the template", () => {
		expect(typographyCss(DEFAULT_TYPOGRAPHY)).toBe("");
		const css = typographyCss({ ...DEFAULT_TYPOGRAPHY, h1Size: 30 });
		expect(css).toContain("--ur-size-h1: 30pt;");
		expect(css).not.toContain("--ur-size-body");
		expect(css).not.toContain("--ur-color-heading");
	});

	it("sets fonts when given", () => {
		expect(typographyCss({ ...DEFAULT_TYPOGRAPHY, codeFont: "Fira Code" })).toContain('--ur-font-code: "Fira Code";');
	});
});

describe("fontFamily", () => {
	it("quotes families, keeps generic ones and strips characters that could escape the declaration", () => {
		expect(fontFamily("Source Serif 4, Georgia, serif")).toBe('"Source Serif 4", "Georgia", serif');
		expect(fontFamily('Evil"; } body { color: red')).toBe('"Evil  body  color: red"');
		expect(fontFamily(" , ")).toBe("");
	});
});
