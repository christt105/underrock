/** Attribute of the marker that keeps a block id, like `^chart`, in the rendered HTML. */
export const BLOCK_ID_ATTRIBUTE = "data-underrock-block-id";

const TRAILING_ID = /(\s)\^([A-Za-z0-9-]+)\s*$/;
const LONE_ID = /^\s*\^([A-Za-z0-9-]+)\s*$/;
const IMAGE_LINE = /^\s*!\[/;
const MATH_END = /\$\$\s*$/;
const CODE_FENCE = /^\s*(`{3,}|~{3,})(.*)$/;

/**
 * Obsidian drops block ids like `^chart` from the HTML it renders, so this turns them into empty
 * marker spans in the Markdown first: at the end of a line of text, or on a line of their own right
 * after an image or display math. Fenced code and math blocks are left alone.
 */
export function markBlockIds(markdown: string): string {
	let closes: ((line: string) => boolean) | null = null;
	const lines = markdown.split("\n");
	return lines
		.map((line, i) => {
			if (closes !== null) {
				if (closes(line)) closes = null;
				return line;
			}
			closes = opensBlock(line);
			if (closes !== null) return line;
			const lone = LONE_ID.exec(line);
			if (lone !== null) return i > 0 && (IMAGE_LINE.test(lines[i - 1]) || MATH_END.test(lines[i - 1])) ? marker(lone[1]) : line;
			return line.replace(TRAILING_ID, (_, space: string, id: string) => `${space}${marker(id)}`);
		})
		.join("\n");
}

/**
 * If the line opens a fenced code or math block, a test for the line that closes it. A line like
 * ```` ```code``` ```` is inline code, not a fence, and `$$x$$` is math on one line.
 */
export function opensBlock(line: string): ((line: string) => boolean) | null {
	const code = CODE_FENCE.exec(line);
	if (code !== null) {
		const [, fence, rest] = code;
		if (fence.startsWith("`") && rest.includes("`")) return null;
		return (l) => new RegExp(`^\\s*${fence[0]}{${fence.length},}\\s*$`).test(l);
	}
	const trimmed = line.trim();
	if (trimmed.startsWith("$$") && !trimmed.slice(2).includes("$$")) return (l) => l.includes("$$");
	return null;
}

function marker(id: string): string {
	return `<span ${BLOCK_ID_ATTRIBUTE}="${id}"></span>`;
}
