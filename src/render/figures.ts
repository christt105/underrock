/** Width-only alt text, as in `![[photo.png|300]]` or `![[photo.png|300x200]]`. */
const SIZE_ONLY = /^\d+(?:x\d+)?$/;

/**
 * Turns paragraphs that hold only images into figures, captioned with each image's alt text.
 * Images on consecutive lines share a paragraph, so they become one row of figures side by side.
 */
export function wrapFigures(root: HTMLElement): void {
	for (const paragraph of Array.from(root.querySelectorAll("p"))) {
		const images = imagesOnly(paragraph);
		if (images === null) continue;
		const figures = images.map(figure);
		if (figures.length === 1) {
			if (figures[0].querySelector("figcaption") === null) continue;
			paragraph.replaceWith(figures[0]);
		} else {
			const row = createDiv({ cls: "underrock-figure-row" });
			row.append(...figures);
			paragraph.replaceWith(row);
		}
	}
}

/** The paragraph's images, if it holds nothing else but line breaks and whitespace. */
function imagesOnly(paragraph: HTMLParagraphElement): Element[] | null {
	const images: Element[] = [];
	for (const node of Array.from(paragraph.childNodes)) {
		if (node.nodeType === node.TEXT_NODE && (node.textContent ?? "").trim() === "") continue;
		if (node.nodeType !== node.ELEMENT_NODE) return null;
		const el = node as Element;
		if (el.tagName === "BR") continue;
		if (el.tagName === "IMG" || (el.classList.contains("image-embed") && el.querySelector("img") !== null)) {
			images.push(el);
			continue;
		}
		return null;
	}
	return images.length > 0 ? images : null;
}

function figure(image: Element): HTMLElement {
	const el = createEl("figure", { cls: "underrock-figure" });
	el.append(image);
	const text = caption(image);
	if (text !== "") el.append(createEl("figcaption", { text }));
	return el;
}

/** The alt text, unless Obsidian filled it in with the file name or it only sets the size. */
function caption(image: Element): string {
	const img = image.tagName === "IMG" ? image : image.querySelector("img");
	const alt = (img?.getAttribute("alt") ?? "").trim();
	const file = image.getAttribute("src") ?? "";
	if (alt === file || alt === file.split("/").pop() || SIZE_ONLY.test(alt)) return "";
	return alt;
}
