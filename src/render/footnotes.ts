/**
 * Moves each footnote's text from the list Obsidian puts at the end of the note to where it is first
 * cited, as an element that Paged.js floats to the bottom of that page and numbers. Later citations
 * of the same footnote keep a plain superscript number, and the list goes away.
 */
export function placeFootnotesOnPages(root: HTMLElement): void {
	const section = root.querySelector("section.footnotes");
	if (section === null) return;
	for (const item of Array.from(section.querySelectorAll("li[data-footnote-id]"))) {
		const number = (item.getAttribute("data-footnote-id") ?? "").replace(/^fn-/, "");
		const refs = Array.from(root.querySelectorAll("sup.footnote-ref")).filter((ref) => {
			const id = ref.getAttribute("data-footnote-id") ?? "";
			return id === `fnref-${number}` || id.startsWith(`fnref-${number}-`);
		});
		if (refs.length === 0) continue;
		item.querySelectorAll(".footnote-backref").forEach((backref) => backref.remove());
		const note = createSpan({ cls: "underrock-footnote" });
		const paragraphs = Array.from(item.children).filter((child) => child.tagName === "P");
		for (const [i, paragraph] of paragraphs.entries()) {
			if (i > 0) note.append(" ");
			note.append(...Array.from(paragraph.childNodes));
		}
		refs[0].replaceWith(note);
		for (const ref of refs.slice(1)) ref.replaceWith(createEl("sup", { cls: "underrock-footnote-ref", text: number }));
	}
	section.remove();
}
