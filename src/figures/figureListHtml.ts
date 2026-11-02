import type { FigureEntry } from "../render/FigureEntry";
import type { FigureListSettings } from "./FigureListSettings";

/** A list of figures on its own page, linking to each figure. Paged.js fills in the page numbers. */
export function figureListHtml(figures: readonly FigureEntry[], list: FigureListSettings): string {
	if (figures.length === 0) return "";
	const items = figures.map((figure) => {
		const caption = figure.caption === "" ? "" : ` <span class="underrock-figure-list-caption">${escapeText(figure.caption)}</span>`;
		return `<li class="underrock-figure-list-entry"><a href="#${escapeAttribute(figure.id)}"><span class="underrock-figure-list-label">${escapeText(figure.label)}</span>${caption}</a></li>`;
	});
	const title = list.title.trim() === "" ? "" : `<p class="underrock-figure-list-title">${escapeText(list.title.trim())}</p>`;
	return `<nav class="underrock-figure-list">${title}<ol>${items.join("")}</ol></nav>`;
}

function escapeText(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(text: string): string {
	return escapeText(text).replace(/"/g, "&quot;");
}
