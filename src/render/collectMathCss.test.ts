// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { collectMathCss } from "./collectMathCss";

describe("collectMathCss", () => {
	it("includes rules MathJax inserted into its stylesheet, not just the element's text", () => {
		document.head.innerHTML = '<style id="MJX-CHTML-styles">mjx-container { display: inline-block; }</style><style id="other">p { color: red; }</style>';
		const style = document.getElementById("MJX-CHTML-styles") as HTMLStyleElement;
		style.sheet?.insertRule('@font-face { font-family: MJX-TEX; src: url("./tex-font/chtml/woff2/mjx-tex-n.woff2"); }', 1);
		const css = collectMathCss(document);
		expect(css).toContain("mjx-container");
		expect(css).toContain("mjx-tex-n.woff2");
		expect(css).not.toContain("color: red");
	});
});
