import type { FigureEntry } from "../render/FigureEntry";
import type { FigureListSettings } from "./FigureListSettings";

/**
 * A list of figures, or of tables, on its own page, linking to each one. Paged.js fills in the page
 * numbers. A list of tables gets the extra class `underrock-table-list`, for templates.
 */
export function figureListHtml(figures: readonly FigureEntry[], list: FigureListSettings, kind: "figure" | "table" = "figure"): string {
	if (figures.length === 0) return "";
	const items = figures.map((figure) => {
		const description =
			figure.description === "" ? "" : ` <span class="underrock-figure-list-description">${escapeText(figure.description)}</span>`;
		return `<li class="underrock-figure-list-entry"><a href="#${escapeAttribute(figure.id)}"><span class="underrock-figure-list-label">${escapeText(figure.label)}</span>${description}</a></li>`;
	});
	const title = list.title.trim() === "" ? "" : `<p class="underrock-figure-list-title">${escapeText(list.title.trim())}</p>`;
	const cls = kind === "table" ? "underrock-figure-list underrock-table-list" : "underrock-figure-list";
	return `<nav class="${cls}">${title}<ol>${items.join("")}</ol></nav>`;
}

function escapeText(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(text: string): string {
	return escapeText(text).replace(/"/g, "&quot;");
}
