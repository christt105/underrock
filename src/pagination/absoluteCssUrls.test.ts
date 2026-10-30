import { describe, expect, it } from "vitest";
import { absoluteCssUrls } from "./absoluteCssUrls";

const BASE = "app://obsidian.md/index.html";

describe("absoluteCssUrls", () => {
	it("resolves root-relative and relative urls against the base", () => {
		expect(absoluteCssUrls('src: url("/lib/mathjax/a.woff2")', BASE)).toBe('src: url("app://obsidian.md/lib/mathjax/a.woff2")');
		expect(absoluteCssUrls("src: url(fonts/b.woff2)", BASE)).toBe("src: url(app://obsidian.md/fonts/b.woff2)");
		expect(absoluteCssUrls("src: url('c.woff2')", BASE)).toBe("src: url('app://obsidian.md/c.woff2')");
	});

	it("leaves absolute, data and fragment urls alone", () => {
		const css = 'a { b: url("data:font/woff2;base64,AA=="); c: url(app://x/y.png); d: url(#clip); e: url("") }';
		expect(absoluteCssUrls(css, BASE)).toBe(css);
	});
});
