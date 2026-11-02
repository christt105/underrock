/** Width-only alt text, as in `![[photo.png|300]]` or `![[photo.png|300x200]]`. */
const SIZE_ONLY = /^\d+(?:x\d+)?$/;

/** The word before a figure number, by primary language subtag. */
const FIGURE_WORDS: Record<string, string> = {
	ca: "Figura",
	de: "Abbildung",
	es: "Figura",
	gl: "Figura",
	it: "Figura",
	nl: "Figuur",
	pt: "Figura",
};

type Line = Node[];

/**
 * Turns paragraphs that hold images into figures. Images on consecutive lines share a paragraph,
 * so they become one figure with its images side by side, labelled (a), (b)… with their alt text.
 * A line of text right below the images is the figure's caption, numbered like "Figure 3: …"; a
 * single image without one is captioned with its alt text. Text right above the images stays a
 * paragraph of its own.
 */
export function wrapFigures(root: HTMLElement, lang: string): void {
	const word = figureWord(lang);
	let number = 0;
	for (const paragraph of Array.from(root.querySelectorAll("p"))) {
		const parts = splitParagraph(paragraph);
		if (parts === null) continue;
		const { before, images, after } = parts;
		let caption: Node[] = after.length > 0 ? joinLines(after, () => paragraph.ownerDocument.createTextNode(" ")) : [];
		if (images.length === 1 && caption.length === 0) {
			const alt = altCaption(images[0]);
			if (alt === "") continue;
			caption = [paragraph.ownerDocument.createTextNode(alt)];
		}
		const figure = createEl("figure", { cls: "underrock-figure" });
		if (images.length === 1) {
			figure.append(images[0]);
		} else {
			const row = createDiv({ cls: "underrock-figure-row" });
			row.append(...images.map(subfigure));
			figure.append(row);
		}
		if (caption.length > 0) {
			number += 1;
			const figcaption = createEl("figcaption");
			figcaption.append(createSpan({ cls: "underrock-figure-label", text: `${word} ${number}:` }), " ", ...caption);
			figure.append(figcaption);
		}
		if (before.length > 0) {
			paragraph.replaceChildren(...joinLines(before, () => createEl("br")));
			paragraph.after(figure);
		} else {
			paragraph.replaceWith(figure);
		}
	}
}

function figureWord(lang: string): string {
	return FIGURE_WORDS[lang.toLowerCase().split("-")[0]] ?? "Figure";
}

/**
 * Splits a paragraph into its lines of text above the images, the images and its lines of text
 * below them, or null if it has no images or text between them.
 */
function splitParagraph(paragraph: HTMLParagraphElement): { before: Line[]; images: Element[]; after: Line[] } | null {
	const lines = paragraphLines(paragraph);
	const isImageLine = lines.map((line) => line.some(isImage) && line.every((node) => isImage(node) || isBlank(node)));
	const first = isImageLine.indexOf(true);
	const last = isImageLine.lastIndexOf(true);
	if (first === -1 || isImageLine.slice(first, last + 1).includes(false)) return null;
	return {
		before: lines.slice(0, first),
		images: lines.slice(first, last + 1).flat().filter(isImage),
		after: lines.slice(last + 1),
	};
}

/** The paragraph's non-blank lines, split at line breaks whether rendered as `<br>` or kept as newlines. */
function paragraphLines(paragraph: HTMLParagraphElement): Line[] {
	const lines: Line[] = [[]];
	for (const node of Array.from(paragraph.childNodes)) {
		if (node.nodeName === "BR") {
			lines.push([]);
		} else if (node.nodeType === node.TEXT_NODE && (node.textContent ?? "").includes("\n")) {
			(node.textContent ?? "").split("\n").forEach((text, i) => {
				if (i > 0) lines.push([]);
				if (text !== "") lines[lines.length - 1].push(paragraph.ownerDocument.createTextNode(text));
			});
		} else {
			lines[lines.length - 1].push(node);
		}
	}
	return lines.filter((line) => !line.every(isBlank));
}

function joinLines(lines: Line[], separator: () => Node): Node[] {
	return lines.flatMap((line, i) => (i === 0 ? line : [separator(), ...line]));
}

function isBlank(node: Node): boolean {
	return node.nodeType === node.TEXT_NODE && (node.textContent ?? "").trim() === "";
}

function isImage(node: Node): node is Element {
	if (node.nodeType !== node.ELEMENT_NODE) return false;
	const el = node as Element;
	return el.tagName === "IMG" || (el.classList.contains("image-embed") && el.querySelector("img") !== null);
}

function subfigure(image: Element, index: number): HTMLElement {
	const el = createEl("figure", { cls: "underrock-subfigure" });
	el.append(image);
	const alt = altCaption(image);
	const letter = `(${String.fromCharCode(97 + (index % 26))})`;
	el.append(createEl("figcaption", { text: alt === "" ? letter : `${letter} ${alt}` }));
	return el;
}

/** The alt text, unless Obsidian filled it in with the file name or it only sets the size. */
function altCaption(image: Element): string {
	const img = image.tagName === "IMG" ? image : image.querySelector("img");
	const alt = (img?.getAttribute("alt") ?? "").trim();
	const file = image.getAttribute("src") ?? "";
	if (alt === file || alt === file.split("/").pop() || SIZE_ONLY.test(alt)) return "";
	return alt;
}
