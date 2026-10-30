import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
import { buildPagedDocument } from "../pagination/buildPagedDocument";
import { DEFAULT_PAGE_SETUP } from "../pagination/PageSetup";
import type { PagedDocumentOptions } from "../pagination/PagedDocumentOptions";
import { PAGE_COUNT_ATTRIBUTE } from "../pagination/pagedScripts";

let browser: Browser | undefined;

export async function closeBrowser(): Promise<void> {
	await browser?.close();
	browser = undefined;
}

/** Loads body HTML into Chromium as a paged document and waits for Paged.js to finish. */
export async function paginate(bodyHtml: string, options: Partial<PagedDocumentOptions> = {}): Promise<Page> {
	browser ??= await chromium.launch();
	const page = await browser.newPage();
	const html = buildPagedDocument(
		{ title: "Layout test", html: bodyHtml, mathCss: "" },
		{ page: DEFAULT_PAGE_SETUP, lang: "en", baseUrl: "about:blank", extraCss: [], ...options },
	);
	await page.setContent(html);
	await page.waitForSelector(`html[${PAGE_COUNT_ATTRIBUTE}]`, { timeout: 30000 });
	return page;
}
