import type { FigureEntry } from "./FigureEntry";
import { BLOCK_ID_ATTRIBUTE } from "./blockIds";
import { SOURCE_LINE_ATTRIBUTE } from "./sourceLines";

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
 * Turns paragraphs that hold images into numbered figures. Images on consecutive lines share a
 * paragraph, so they become one figure with its images side by side, labelled (a), (b)… The caption,
 * as in "Figure 3: …", is the line of text right below the images followed by each image's alt text
 * after its letter; a single image without that line is captioned with its alt text. Text right
 * above the images stays a paragraph of its own.
 *
 * Every figure gets an id, from its block id, like `^chart`, when it has one.
 */
export function wrapFigures(root: HTMLElement, lang: string): FigureEntry[] {
	const word = figureWord(lang);
	const entries: FigureEntry[] = [];
	const blockIds = new Set<string>();
	let number = 0;
	for (const paragraph of Array.from(root.querySelectorAll("p"))) {
		const parts = splitParagraph(paragraph);
		if (parts === null) continue;
		const { before, images, after } = parts;
		const blockId = paragraph.querySelector(`[${BLOCK_ID_ATTRIBUTE}]`)?.getAttribute(BLOCK_ID_ATTRIBUTE) ?? "";
		const space = () => paragraph.ownerDocument.createTextNode(" ");
		const pieces: Node[][] = after.length > 0 ? [joinLines(after, space)] : [];
		if (images.length === 1) {
			const alt = altCaption(images[0]);
			if (pieces.length === 0 && alt !== "") pieces.push([paragraph.ownerDocument.createTextNode(alt)]);
		} else {
			images.forEach((image, i) => {
				const alt = altCaption(image);
				if (alt !== "") pieces.push([paragraph.ownerDocument.createTextNode(`${letter(i)} ${alt}`)]);
			});
		}
		const caption = joinLines(pieces, space);
		// The list of figures gets the description alone, without each image's (a), (b)… text.
		const description = after.length > 0 || images.length === 1 ? textOf(pieces[0] ?? []) : "";
		number += 1;
		const figure = createEl("figure", { cls: "underrock-figure" });
		if (images.length === 1) {
			figure.append(images[0]);
		} else {
			const row = createDiv({ cls: "underrock-figure-row" });
			row.append(...images.map(subfigure));
			figure.append(row);
		}
		const figcaption = createEl("figcaption");
		if (caption.length > 0) {
			figcaption.append(createSpan({ cls: "underrock-figure-label", text: `${word} ${number}:` }), " ", ...caption);
		} else {
			figcaption.append(createSpan({ cls: "underrock-figure-label", text: `${word} ${number}` }));
		}
		figure.append(figcaption);
		const named = blockId !== "" && !blockIds.has(blockId);
		if (named) blockIds.add(blockId);
		figure.id = named ? `figure-${blockId}` : `underrock-figure-${number}`;
		entries.push({
			id: figure.id,
			label: `${word} ${number}`,
			description,
			blockId: named ? blockId : "",
		});
		if (before.length > 0) {
			paragraph.replaceChildren(...joinLines(before, () => createEl("br")));
			paragraph.after(figure);
		} else {
			paragraph.replaceWith(figure);
		}
	}
	return entries;
}

function textOf(nodes: Node[]): string {
	return nodes
		.map((node) => node.textContent ?? "")
		.join("")
		.replace(/\s+/g, " ")
		.trim();
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

/** Whitespace, or the marker of a block id or a source line, which has no content. */
function isBlank(node: Node): boolean {
	if (node.nodeType === node.ELEMENT_NODE) {
		const el = node as Element;
		return el.hasAttribute(BLOCK_ID_ATTRIBUTE) || el.hasAttribute(SOURCE_LINE_ATTRIBUTE);
	}
	return node.nodeType === node.TEXT_NODE && (node.textContent ?? "").trim() === "";
}

function isImage(node: Node): node is Element {
	if (node.nodeType !== node.ELEMENT_NODE) return false;
	const el = node as Element;
	return el.tagName === "IMG" || (el.classList.contains("image-embed") && el.querySelector("img") !== null);
}

function subfigure(image: Element, index: number): HTMLElement {
	const el = createEl("figure", { cls: "underrock-subfigure" });
	el.append(image, createEl("figcaption", { text: letter(index) }));
	return el;
}

/** The label of the subfigure at `index`: (a), (b)… */
function letter(index: number): string {
	return `(${String.fromCharCode(97 + (index % 26))})`;
}

/** The alt text, unless Obsidian filled it in with the file name or it only sets the size. */
function altCaption(image: Element): string {
	const img = image.tagName === "IMG" ? image : image.querySelector("img");
	const alt = (img?.getAttribute("alt") ?? "").trim();
	const file = image.getAttribute("src") ?? "";
	if (alt === file || alt === file.split("/").pop() || SIZE_ONLY.test(alt)) return "";
	return alt;
}
