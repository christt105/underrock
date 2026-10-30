import { PAGE_COUNT_ATTRIBUTE, PAGINATED_EVENT } from "../../pagination/pagedScripts";
import type { HeadingPosition } from "../../pdf/HeadingPosition";
import type { PrintedDocument } from "./PrintedDocument";
import type { PrintWebview } from "./PrintWebview";

const PAGINATION_TIMEOUT_MS = 120000;

/**
 * A page of the app that the print webview can load. Vault resource URLs don't load in a webview,
 * so the document is written into this page instead, where vault images and MathJax fonts resolve
 * from the app's own origin.
 */
const PRINT_HOST_URL = "app://obsidian.md/help.html";

/** Script evaluated in the printed page; resolves once Paged.js has laid out every page. */
export const WAIT_FOR_PAGINATION = `new Promise((resolve, reject) => {
	if (document.documentElement.hasAttribute("${PAGE_COUNT_ATTRIBUTE}")) return resolve(true);
	window.addEventListener("${PAGINATED_EVENT}", () => resolve(true), { once: true });
	setTimeout(() => reject(new Error("Pagination timed out")), ${PAGINATION_TIMEOUT_MS});
})`;

/** Script evaluated in the paginated page; returns where each heading landed, for PDF bookmarks. */
export const HEADING_POSITIONS = `Array.from(document.querySelectorAll(".pagedjs_page")).flatMap((page, pageIndex) => {
	const box = page.getBoundingClientRect();
	return Array.from(page.querySelectorAll(".pagedjs_page_content :is(h1, h2, h3, h4, h5, h6):not([data-split-from])")).map((heading) => ({
		level: Number(heading.tagName.slice(1)),
		title: (heading.textContent || "").trim(),
		pageIndex,
		top: heading.getBoundingClientRect().top - box.top,
		pageHeight: box.height,
	}));
})`;

/** Script that replaces the current page with `html`, running its scripts. */
export function writeDocumentScript(html: string): string {
	return `document.open(); document.write(${JSON.stringify(html)}); document.close(); true`;
}

/** Prints a self-paginating HTML document to PDF with Electron's `printToPDF`. */
export async function printHtmlToPdf(html: string): Promise<PrintedDocument> {
	const webview = activeDocument.body.createEl("webview" as keyof HTMLElementTagNameMap, { cls: "underrock-print-webview" }) as PrintWebview;
	try {
		const ready = once(webview, "dom-ready", "did-fail-load");
		webview.setAttribute("src", PRINT_HOST_URL);
		if ((await ready) === "did-fail-load") throw new Error("Could not open the page to print");
		await webview.executeJavaScript(writeDocumentScript(html));
		await webview.executeJavaScript(WAIT_FOR_PAGINATION);
		const headings = (await webview.executeJavaScript(HEADING_POSITIONS)) as HeadingPosition[];
		const pdf = await webview.printToPDF({ preferCSSPageSize: true, printBackground: true });
		return { pdf, headings };
	} finally {
		webview.remove();
	}
}

function once(el: HTMLElement, ...events: string[]): Promise<string> {
	return new Promise((resolve) => {
		for (const event of events) el.addEventListener(event, () => resolve(event), { once: true });
	});
}
