import { SOURCE_LINE_ATTRIBUTE } from "../render/sourceLines";

/** A word picked in the preview, with the text around it in the same block. */
export interface ClickedWord {
	readonly word: string;
	readonly before: string;
	readonly after: string;
	/** The note's line the word is on, from 0, or null where lines are not marked, like headings and tables. */
	readonly line: number | null;
}

/** A range of the note's Markdown, as character offsets. */
export interface SourceRange {
	readonly from: number;
	readonly to: number;
}

/** Elements whose text is read as the context of a clicked word. */
const BLOCKS = "p, li, h1, h2, h3, h4, h5, h6, td, th, figcaption, dt, dd, pre, blockquote";

/** Words compared on each side of the clicked word. */
const CONTEXT_WORDS = 8;

/** Words of the note searched on each side of a match for that context, which Markdown syntax can push apart. */
const SOURCE_WINDOW = 12;

const WORD = /[\p{L}\p{M}\p{N}]+/gu;

interface Token {
	readonly text: string;
	readonly start: number;
	readonly end: number;
}

/** The word selected in the preview, as a double-click selects it, and the text around it in its block. */
export function clickedWord(doc: Document): ClickedWord | null {
	const selection = doc.getSelection();
	if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
	const range = selection.getRangeAt(0);
	const word = range.toString().trim();
	if (word === "") return null;
	const start = range.startContainer;
	const startEl = start.nodeType === start.ELEMENT_NODE ? (start as Element) : start.parentElement;
	const block = startEl?.closest(BLOCKS) ?? null;
	const context = block ?? doc.body;
	const before = doc.createRange();
	before.setStart(context, 0);
	before.setEnd(range.startContainer, range.startOffset);
	const after = doc.createRange();
	after.setStart(range.endContainer, range.endOffset);
	after.setEnd(context, context.childNodes.length);
	return { word, before: before.toString(), after: after.toString(), line: block ? lineAfter(range, block) : null };
}

/**
 * The line in the first line marker after the selection, in its block or, where Paged.js split the
 * block across pages, in the parts that continue it.
 */
function lineAfter(range: Range, block: Element): number | null {
	const parts = [block];
	const ref = block.getAttribute("data-ref");
	if (ref !== null) {
		for (const part of Array.from(block.ownerDocument.querySelectorAll("[data-split-from]"))) {
			if (part.getAttribute("data-split-from") === ref) parts.push(part);
		}
	}
	for (const part of parts) {
		for (const marker of Array.from(part.querySelectorAll(`[${SOURCE_LINE_ATTRIBUTE}]`))) {
			if (range.comparePoint(marker, 0) > 0) return Number(marker.getAttribute(SOURCE_LINE_ATTRIBUTE));
		}
	}
	return null;
}

/**
 * Where the clicked word is in the note's Markdown: on its marked line, selecting the word there if
 * it can be found, or else anywhere in the note.
 */
export function locateInSource(source: string, clicked: ClickedWord): SourceRange | null {
	const lines = source.split("\n");
	if (clicked.line === null || clicked.line >= lines.length) return findInSource(source, clicked);
	const lineStart = lines.slice(0, clicked.line).reduce((offset, line) => offset + line.length + 1, 0);
	const inLine = findInSource(lines[clicked.line], clicked);
	if (inLine === null) return { from: lineStart, to: lineStart };
	return { from: lineStart + inLine.from, to: lineStart + inLine.to };
}

/**
 * Where the clicked word is in the note's Markdown. Of every place the word appears, picks the one
 * with most of the words around it in the preview nearby, since the rendered text and the Markdown
 * differ by syntax like `**`, links and line breaks. Null if the word is not in the note, like the
 * figure numbers or page numbers Underrock adds.
 */
export function findInSource(source: string, clicked: ClickedWord): SourceRange | null {
	const target = tokens(clicked.word);
	if (target.length === 0) return null;
	const before = tokens(clicked.before)
		.slice(-CONTEXT_WORDS)
		.map((t) => t.text);
	const after = tokens(clicked.after)
		.slice(0, CONTEXT_WORDS)
		.map((t) => t.text);
	const words = tokens(hideLinkTargets(source));
	let best = -1;
	let bestScore = -1;
	for (let i = 0; i + target.length <= words.length; i++) {
		if (!target.every((t, k) => words[i + k].text === t.text)) continue;
		const end = i + target.length;
		const score =
			overlap(before, words.slice(Math.max(0, i - SOURCE_WINDOW), i)) + overlap(after, words.slice(end, end + SOURCE_WINDOW));
		if (score > bestScore) {
			best = i;
			bestScore = score;
		}
	}
	if (best === -1) return null;
	return { from: words[best].start, to: words[best + target.length - 1].end };
}

/** Blanks out what links point to, which the preview does not show, keeping every offset. */
function hideLinkTargets(source: string): string {
	return source
		.replace(/\[\[([^\]|\n]*)\|/g, (_, target: string) => `[[${" ".repeat(target.length)}|`)
		.replace(/\]\(([^)\n]*)\)/g, (_, url: string) => `](${" ".repeat(url.length)})`);
}

function tokens(text: string): Token[] {
	return Array.from(text.matchAll(WORD), (match) => ({
		text: match[0].normalize("NFC").toLowerCase(),
		start: match.index,
		end: match.index + match[0].length,
	}));
}

/** How many of `context` appear among `nearby`, each word of `nearby` counted once. */
function overlap(context: readonly string[], nearby: readonly Token[]): number {
	const left = nearby.map((t) => t.text);
	let count = 0;
	for (const word of context) {
		const i = left.indexOf(word);
		if (i === -1) continue;
		left.splice(i, 1);
		count++;
	}
	return count;
}
