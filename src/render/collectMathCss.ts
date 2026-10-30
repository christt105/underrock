/** Returns the stylesheets MathJax injected into `doc`, which rendered formulas need to display. */
export function collectMathCss(doc: Document): string {
	return Array.from(doc.querySelectorAll("style"))
		.filter((style) => style.id.startsWith("MJX"))
		.map((style) => style.textContent ?? "")
		.join("\n");
}
