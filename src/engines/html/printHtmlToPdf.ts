import type { DataAdapter } from "obsidian";
import { PAGE_COUNT_ATTRIBUTE, PAGINATED_EVENT } from "../../pagination/pagedScripts";
import type { PrintWebview } from "./PrintWebview";

const PAGINATION_TIMEOUT_MS = 120000;

/** Script evaluated in the printed page; resolves once Paged.js has laid out every page. */
export const WAIT_FOR_PAGINATION = `new Promise((resolve, reject) => {
	if (document.documentElement.hasAttribute("${PAGE_COUNT_ATTRIBUTE}")) return resolve(true);
	window.addEventListener("${PAGINATED_EVENT}", () => resolve(true), { once: true });
	setTimeout(() => reject(new Error("Pagination timed out")), ${PAGINATION_TIMEOUT_MS});
})`;

/**
 * Prints a self-paginating HTML document to PDF with Electron's `printToPDF`.
 * The document is written next to the plugin and loaded through the app's resource URL,
 * so vault images and MathJax fonts resolve from the same origin as in the app.
 */
export async function printHtmlToPdf(adapter: DataAdapter, scratchDir: string, html: string): Promise<Uint8Array> {
	const path = `${scratchDir}/.underrock-print-${Date.now()}.html`;
	await adapter.write(path, html);
	const webview = activeDocument.body.createEl("webview" as keyof HTMLElementTagNameMap, { cls: "underrock-print-webview" }) as PrintWebview;
	try {
		const loaded = once(webview, "did-finish-load", "did-fail-load");
		webview.setAttribute("src", adapter.getResourcePath(path));
		if ((await loaded) === "did-fail-load") throw new Error("Could not load the document to print");
		await webview.executeJavaScript(WAIT_FOR_PAGINATION);
		return await webview.printToPDF({ preferCSSPageSize: true, printBackground: true });
	} finally {
		webview.remove();
		await adapter.remove(path);
	}
}

function once(el: HTMLElement, ...events: string[]): Promise<string> {
	return new Promise((resolve) => {
		for (const event of events) el.addEventListener(event, () => resolve(event), { once: true });
	});
}
