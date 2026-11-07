import { opensBlock } from "./blockIds";

/** Attribute of the marker that keeps a line's number in the note, from 0, in the rendered HTML. */
export const SOURCE_LINE_ATTRIBUTE = "data-underrock-line";

const HEADING = /^\s{0,3}#{1,6}(\s|$)/;
const SETEXT_UNDERLINE = /^\s{0,3}(=+|-+)\s*$/;
const THEMATIC_BREAK = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
const CALLOUT_HEADER = /^\s*(>\s*)+\[!/;
const TABLE_DELIMITER = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
const LIST_ITEM = /^\s*([-*+]|\d+[.)])\s/;
const INDENTED = /^( {4}|\t)/;
const HARD_BREAK = /( {2,}|\\)$/;

/**
 * Ends each line of text with an empty marker span holding its line number in the note, so a word
 * in the preview can be traced back to its line. `firstLine` is the number of the Markdown's first
 * line, after the frontmatter. Lines where a marker would change what renders are left alone: code
 * and math blocks, headings (their text names them in links), tables, callout titles, horizontal
 * rules and indented code.
 */
export function markSourceLines(markdown: string, firstLine: number): string {
	const lines = markdown.split("\n");
	const skip = new Array<boolean>(lines.length).fill(false);
	let closes: ((line: string) => boolean) | null = null;
	let inList = false;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (closes !== null) {
			skip[i] = true;
			if (closes(line)) closes = null;
			continue;
		}
		closes = opensBlock(line);
		const blank = line.trim() === "";
		const previousBlank = i === 0 || lines[i - 1].trim() === "";
		if (LIST_ITEM.test(line)) inList = true;
		else if (!blank && previousBlank && !INDENTED.test(line)) inList = false;
		const next = lines[i + 1] ?? "";
		if (
			closes !== null ||
			blank ||
			HEADING.test(line) ||
			THEMATIC_BREAK.test(line) ||
			SETEXT_UNDERLINE.test(next) ||
			CALLOUT_HEADER.test(line) ||
			line.trim().startsWith("$$") ||
			(INDENTED.test(line) && previousBlank && !inList)
		) {
			skip[i] = true;
		} else if (line.includes("|") && TABLE_DELIMITER.test(next) && next.includes("-")) {
			for (let j = i; j < lines.length && lines[j].trim() !== "" && lines[j].includes("|"); j++) skip[j] = true;
		}
	}
	return lines.map((line, i) => (skip[i] ? line : withMarker(line, firstLine + i))).join("\n");
}

/** Adds the marker before a trailing hard line break, so the break still works. */
function withMarker(line: string, number: number): string {
	const marker = `<span ${SOURCE_LINE_ATTRIBUTE}="${number}"></span>`;
	const hardBreak = HARD_BREAK.exec(line);
	if (hardBreak === null) return line + marker;
	return line.slice(0, hardBreak.index) + marker + hardBreak[0];
}
