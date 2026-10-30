import type { CoverContent } from "./CoverContent";

/** A title page with the note's title, author and date. */
export function coverHtml(content: CoverContent): string {
	const line = (cls: string, text: string | undefined) =>
		text === undefined || text.trim() === "" ? "" : `<p class="underrock-cover-${cls}">${escapeText(text.trim())}</p>`;
	return `<section class="underrock-cover">${line("title", content.title)}${line("author", content.author)}${line("date", content.date)}</section>`;
}

function escapeText(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
