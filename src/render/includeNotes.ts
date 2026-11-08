import { markBlockIds, opensBlock } from "./blockIds";
import { markSourceLines } from "./sourceLines";

/** A note's vault path and Markdown, frontmatter included. */
export interface NoteText {
	readonly path: string;
	readonly markdown: string;
}

/** Finds the note a link points to from another note, or null if it is not a note in the vault. */
export type LoadNote = (link: string, fromPath: string) => Promise<NoteText | null>;

/** The main note's Markdown with its included notes in place, ready to render. */
export interface IncludedMarkdown {
	readonly markdown: string;
	/** Vault paths of the notes included, in order. */
	readonly included: readonly string[];
}

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/;
/** `![[Note]]` or `![[Note#Heading|alias]]` alone on its line, maybe ending with a line marker. */
const INCLUDE = /^\s*!\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]\s*(<span [^>]*><\/span>)?\s*$/;
const NOT_A_NOTE = /\.(png|jpe?g|gif|bmp|svg|webp|avif|pdf|mp3|wav|ogg|m4a|flac|mp4|webm|ogv|mov|mkv|canvas|base)$/i;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const FOOTNOTE = /\[\^([^\]\s]+)\]/g;

/**
 * Puts each note embedded alone on its line, like `![[Chapter 1]]`, in place of the embed, the way
 * LaTeX's `\include` does, so a main note can gather several notes into one document. Each included
 * note starts on a new page unless nothing comes before it, and `![[Note#Heading]]` takes only that
 * section. Notes are prepared one by one, so their block ids and line markers stay their own, and
 * footnote labels are made unique per included note. A note that would include itself is skipped.
 */
export async function includeNotes(main: NoteText, load: LoadNote): Promise<IncludedMarkdown> {
	const included: string[] = [];
	const markdown = await expand(main, null, undefined, [main.path], load, included);
	return { markdown, included };
}

/** Id of the anchor at the start of an included note, which links to the note point at. */
export function noteAnchorId(path: string): string {
	return `note-${path.replace(/\.md$/i, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "")}`;
}

async function expand(
	note: NoteText,
	section: string | null,
	footnotePrefix: string | undefined,
	stack: readonly string[],
	load: LoadNote,
	included: string[],
): Promise<string> {
	const frontmatter = FRONTMATTER.exec(note.markdown)?.[0] ?? "";
	const firstLine = frontmatter.split("\n").length - 1;
	let body = note.markdown.slice(frontmatter.length).replace(/\r\n/g, "\n");
	if (footnotePrefix !== undefined) body = body.replace(FOOTNOTE, (_, label: string) => `[^${footnotePrefix}-${label}]`);
	let lines = markSourceLines(markBlockIds(body), firstLine, stack.length > 1 ? note.path : undefined).split("\n");
	if (section !== null) {
		const [start, end] = sectionRange(body.split("\n"), section);
		lines = lines.slice(start, end);
	}
	const out: string[] = [];
	let closes: ((line: string) => boolean) | null = null;
	let contentBefore = false;
	for (const line of lines) {
		if (closes !== null) {
			if (closes(line)) closes = null;
			out.push(line);
			continue;
		}
		closes = opensBlock(line);
		const embed = closes === null ? INCLUDE.exec(line) : null;
		const [link, subpath] = (embed?.[1] ?? "").split("#");
		const child = embed && !NOT_A_NOTE.test(link) && !(subpath ?? "").startsWith("^") ? await load(link.trim(), note.path) : null;
		if (child === null || stack.includes(child.path)) {
			out.push(line);
			if (line.replace(/<span [^>]*><\/span>/g, "").trim() !== "") contentBefore = true;
			continue;
		}
		included.push(child.path);
		const text = await expand(child, subpath?.trim() || null, `n${included.length}`, [...stack, child.path], load, included);
		if (contentBefore) out.push("", '<div class="page-break"></div>');
		out.push("", `<div id="${noteAnchorId(child.path)}" class="underrock-note-start"></div>`, "", text, "");
		contentBefore = true;
	}
	return out.join("\n");
}

/** The lines of the section under a heading, from the heading to the next one of the same or a higher level. */
function sectionRange(lines: readonly string[], heading: string): [number, number] {
	const wanted = heading.toLowerCase();
	const start = lines.findIndex((line) => HEADING.exec(line)?.[2].toLowerCase() === wanted);
	if (start === -1) return [0, 0];
	const level = (HEADING.exec(lines[start]) as RegExpExecArray)[1].length;
	const next = lines.findIndex((line, i) => {
		const match = i > start ? HEADING.exec(line) : null;
		return match !== null && match[1].length <= level;
	});
	return [start, next === -1 ? lines.length : next];
}
