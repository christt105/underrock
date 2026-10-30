import { buildHtmlDocument } from "../render/buildHtmlDocument";
import { DOCUMENT_CSS } from "../render/documentCss";
import type { RenderedNote } from "../render/RenderedNote";
import type { PagedDocumentOptions } from "./PagedDocumentOptions";
import { pageCss } from "./pageCss";
import { PAGED_SCRIPTS } from "./pagedScripts";
import { PAGINATION_CSS, SCREEN_CSS } from "./paginationCss";

/** A standalone document that paginates itself with Paged.js when loaded. */
export function buildPagedDocument(note: RenderedNote, options: PagedDocumentOptions): string {
	return buildHtmlDocument({
		title: note.title,
		lang: options.lang,
		baseUrl: options.baseUrl,
		bodyHtml: note.html,
		stylesheets: [DOCUMENT_CSS, PAGINATION_CSS, note.mathCss, pageCss(options.page), ...options.extraCss],
		screenStylesheets: [SCREEN_CSS],
		scripts: PAGED_SCRIPTS,
	});
}
