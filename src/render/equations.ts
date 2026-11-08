import { BLOCK_ID_ATTRIBUTE } from "./blockIds";
import { SOURCE_LINE_ATTRIBUTE } from "./sourceLines";

/** The word before an equation number in links, by primary language subtag. */
const EQUATION_WORDS: Record<string, string> = {
	ca: "Equació",
	de: "Gleichung",
	es: "Ecuación",
	fr: "Équation",
	gl: "Ecuación",
	it: "Equazione",
	nl: "Vergelijking",
	pt: "Equação",
};

/** A numbered equation, for links to its block id. */
export interface EquationEntry {
	/** Id of the equation element. */
	readonly id: string;
	/** What links to it show, like "Equation (3)". */
	readonly label: string;
	readonly blockId: string;
}

/**
 * Numbers display math that has a block id, like `$$E = mc^2$$ ^einstein`, as LaTeX numbers an
 * equation with a label: (1), (2)… on its right, in order. Obsidian renders math on lines of its own
 * as a block followed by a paragraph holding the id, and math on one line as part of a paragraph.
 */
export function numberEquations(root: HTMLElement, lang: string): EquationEntry[] {
	const word = EQUATION_WORDS[lang.toLowerCase().split("-")[0]] ?? "Equation";
	const entries: EquationEntry[] = [];
	const blockIds = new Set<string>();
	for (const marker of Array.from(root.querySelectorAll(`[${BLOCK_ID_ATTRIBUTE}]`))) {
		const blockId = marker.getAttribute(BLOCK_ID_ATTRIBUTE) ?? "";
		if (blockId === "" || blockIds.has(blockId)) continue;
		const equation = equationOf(marker);
		if (equation === null) continue;
		blockIds.add(blockId);
		const number = entries.length + 1;
		equation.classList.add("underrock-equation");
		equation.id = `equation-${blockId}`;
		equation.append(createSpan({ cls: "underrock-equation-number", text: `(${number})` }));
		entries.push({ id: equation.id, label: `${word} (${number})`, blockId });
	}
	return entries;
}

/** The display math a block id marker belongs to, or null if it marks something else. */
function equationOf(marker: Element): Element | null {
	const paragraph = marker.parentElement;
	if (paragraph === null || paragraph.tagName !== "P") return null;
	// Math on one line: the last display math in the paragraph, with nothing but markers after it.
	const inline = Array.from(paragraph.children)
		.filter((child) => child.classList.contains("math-block"))
		.pop();
	if (inline !== undefined) return onlyMarkersAfter(inline) ? inline : null;
	// Math on lines of its own: a paragraph of markers right after the math block, which takes them.
	const block = paragraph.previousElementSibling;
	if (block === null || !block.classList.contains("math-block") || !Array.from(paragraph.childNodes).every(isEmpty)) return null;
	block.append(...Array.from(paragraph.children));
	paragraph.remove();
	return block;
}

function onlyMarkersAfter(el: Element): boolean {
	for (let node = el.nextSibling; node !== null; node = node.nextSibling) {
		if (!isEmpty(node)) return false;
	}
	return true;
}

/** Whitespace, a line break, or a block id or source line marker. */
function isEmpty(node: Node): boolean {
	if (node.nodeType === node.TEXT_NODE) return (node.textContent ?? "").trim() === "";
	if (node.nodeType !== node.ELEMENT_NODE) return false;
	const el = node as Element;
	return el.tagName === "BR" || el.hasAttribute(BLOCK_ID_ATTRIBUTE) || el.hasAttribute(SOURCE_LINE_ATTRIBUTE);
}
