/**
 * Scrolls to the target of links within the document, like `#figure-chart`, instead of following
 * them. The preview is loaded with `srcdoc`, so its `<base>` (there for images and fonts) would
 * resolve them to Obsidian's own page and navigate the preview away.
 */
export function keepLinksInDocument(doc: Document): void {
	doc.addEventListener("click", (event) => {
		const target = event.target as Element | null;
		const link = target?.closest?.('a[href^="#"]');
		if (!link) return;
		event.preventDefault();
		const id = decodeURIComponent((link.getAttribute("href") ?? "").slice(1));
		if (id !== "") doc.getElementById(id)?.scrollIntoView({ block: "start" });
	});
}
