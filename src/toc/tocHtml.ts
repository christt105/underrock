import type { HeadingEntry } from "../render/HeadingEntry";
import type { TocSettings } from "./TocSettings";

/** A table of contents on its own page, linking to each heading. Paged.js fills in the page numbers. */
export function tocHtml(headings: readonly HeadingEntry[], toc: TocSettings): string {
	const depth = Math.min(6, Math.max(1, Math.round(toc.depth)));
	const entries = headings.filter((heading) => heading.level <= depth && heading.text !== "");
	if (entries.length === 0) return "";
	const top = Math.min(...entries.map((heading) => heading.level));
	const items = entries.map(
		(heading) =>
			`<li class="underrock-toc-entry" data-depth="${heading.level - top}"><a href="#${escapeAttribute(heading.id)}">${escapeText(heading.text)}</a></li>`,
	);
	const title = toc.title.trim() === "" ? "" : `<p class="underrock-toc-title">${escapeText(toc.title.trim())}</p>`;
	return `<nav class="underrock-toc">${title}<ol>${items.join("")}</ol></nav>`;
}

function escapeText(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(text: string): string {
	return escapeText(text).replace(/"/g, "&quot;");
}
