/** Returns the stylesheets MathJax injected into `doc`, which rendered formulas need to display. */
export function collectMathCss(doc: Document): string {
	return Array.from(doc.querySelectorAll("style"))
		.filter((style) => style.id.startsWith("MJX"))
		.map(styleText)
		.join("\n");
}

/**
 * The rules of a style element. MathJax adds the fonts and glyphs it needs with `insertRule`, which
 * only shows in the stylesheet's rules, not in the element's text.
 */
function styleText(style: HTMLStyleElement): string {
	try {
		const rules = style.sheet?.cssRules;
		if (rules) return Array.from(rules, (rule) => rule.cssText).join("\n");
	} catch {
		// The rules of a stylesheet from another origin cannot be read; its text is all there is.
	}
	return style.textContent ?? "";
}
