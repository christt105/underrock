import { describe, expect, it } from "vitest";
import { fontFaceCss } from "./fontFaceCss";

function face(path: string): string {
	return fontFaceCss([{ path, url: `app://x/${path}` }]);
}

describe("fontFaceCss", () => {
	it("reads family, weight and style from Family-Style file names", () => {
		const css = face("Fonts/Inter-BoldItalic.woff2");
		expect(css).toContain('font-family: "Inter";');
		expect(css).toContain("font-weight: 700;");
		expect(css).toContain("font-style: italic;");
		expect(css).toContain('src: url("app://x/Fonts/Inter-BoldItalic.woff2") format("woff2");');
	});

	it("treats a file without a style suffix as the regular face", () => {
		const css = face("Fonts/Literata.ttf");
		expect(css).toContain('font-family: "Literata";');
		expect(css).toContain("font-weight: 400;");
		expect(css).toContain('format("truetype")');
	});

	it("keeps an unknown suffix as part of the family name", () => {
		expect(face("Fonts/Source-Serif.otf")).toContain('font-family: "Source-Serif";');
	});
});
