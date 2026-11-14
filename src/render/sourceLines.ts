import { opensBlock } from "./blockIds";

/** Attribute of the marker that keeps a line's number in the note, from 0, in the rendered HTML. */
export const SOURCE_LINE_ATTRIBUTE = "data-underrock-line";

/** Attribute of the same marker that names the included note the line comes from, if not the main one. */
export const SOURCE_FILE_ATTRIBUTE = "data-underrock-file";

/** A heading, also inside a list item or a quote, like `- ## Title` or `> ## Title`. */
const HEADING = /^\s*((>\s*)|(([-*+]|\d+[.)])\s+))*#{1,6}(\s|$)/;
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
 * rules and indented code. `file` is the vault path of an included note the lines come from.
 */
export function markSourceLines(markdown: string, firstLine: number, file?: string): string {
	const lines = markdown.split("\n");
	const skip = new Array<boolean>(lines.length).fill(false);
	let closes: ((line: string) => boolean) | null = null;
	let inList = false;
	let indentedCode = false;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const blank = line.trim() === "";
		const indented = INDENTED.test(line);
		if (closes !== null) {
			skip[i] = true;
			if (closes(line)) closes = null;
			continue;
		}
		if (indentedCode) {
			if (blank || indented) {
				skip[i] = true;
				continue;
			}
			indentedCode = false;
		}
		// An indented line continues a paragraph of text right above it; anywhere else outside a list it is code.
		const previousIsText = i > 0 && !skip[i - 1] && lines[i - 1].trim() !== "";
		if (LIST_ITEM.test(line)) inList = true;
		else if (!blank && !previousIsText && !indented) inList = false;
		if (indented && !inList && !previousIsText) {
			indentedCode = true;
			skip[i] = true;
			continue;
		}
		closes = opensBlock(line);
		const next = lines[i + 1] ?? "";
		if (
			closes !== null ||
			blank ||
			HEADING.test(line) ||
			THEMATIC_BREAK.test(line) ||
			SETEXT_UNDERLINE.test(next) ||
			CALLOUT_HEADER.test(line) ||
			line.trim().startsWith("$$")
		) {
			skip[i] = true;
		} else if (line.includes("|") && TABLE_DELIMITER.test(next) && next.includes("-")) {
			for (let j = i; j < lines.length && lines[j].trim() !== "" && lines[j].includes("|"); j++) skip[j] = true;
		}
	}
	const fileAttribute = file === undefined ? "" : ` ${SOURCE_FILE_ATTRIBUTE}="${file.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`;
	return lines.map((line, i) => (skip[i] ? line : withMarker(line, `<span ${SOURCE_LINE_ATTRIBUTE}="${firstLine + i}"${fileAttribute}></span>`))).join("\n");
}

/** Adds the marker before a trailing hard line break, so the break still works. */
function withMarker(line: string, marker: string): string {
	const hardBreak = HARD_BREAK.exec(line);
	if (hardBreak === null) return line + marker;
	return line.slice(0, hardBreak.index) + marker + hardBreak[0];
}
