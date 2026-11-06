import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { PDFDict, PDFDocument, PDFHexString, PDFName } from "pdf-lib";
import { chromium } from "playwright";
import { afterAll, describe, expect, it } from "vitest";
import { buildPagedDocument } from "../../pagination/buildPagedDocument";
import { DEFAULT_PAGE_SETUP } from "../../pagination/PageSetup";
import { finishPdf } from "../../pdf/finishPdf";
import type { HeadingPosition } from "../../pdf/HeadingPosition";
import { OBSIDIAN_FIXTURE } from "../../testing/obsidianFixture";
import { HEADING_POSITIONS, WAIT_FOR_PAGINATION, writeDocumentScript } from "./printHtmlToPdf";

const dir = mkdtempSync(join(tmpdir(), "underrock-print-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("printing a paged document", () => {
	it("writes the document into a page, waits for pagination and prints a PDF with embedded fonts, metadata, links and bookmarks", async () => {
		const html = buildPagedDocument(
			{ title: "Sample", html: OBSIDIAN_FIXTURE, mathCss: "", headings: [] },
			{ page: DEFAULT_PAGE_SETUP, lang: "en", baseUrl: "about:blank", extraCss: [] },
		);
		const file = join(dir, "host.html");
		writeFileSync(file, "<!DOCTYPE html><html><body></body></html>");

		const browser = await chromium.launch();
		try {
			const page = await browser.newPage();
			await page.goto(pathToFileURL(file).href);
			await page.evaluate(writeDocumentScript(html));
			await page.evaluate(WAIT_FOR_PAGINATION);
			const pages = await page.locator(".pagedjs_page").count();
			const headings = await page.evaluate<HeadingPosition[]>(HEADING_POSITIONS);
			const printed = await page.pdf({ preferCSSPageSize: true, printBackground: true });

			expect(Buffer.from(printed).toString("latin1")).toMatch(/\/FontFile[23]?\b/);

			const pdf = await finishPdf(printed, { title: "Sample", author: "Someone", language: "es" }, headings);
			const doc = await PDFDocument.load(pdf);
			expect(doc.getPageCount()).toBe(pages);
			expect(doc.getTitle()).toBe("Sample");
			expect(doc.getAuthor()).toBe("Someone");
			expect(doc.getCreator()).toBe("Underrock");

			const links = doc
				.getPages()
				.flatMap((p) => p.node.Annots()?.asArray() ?? [])
				.map((ref) => doc.context.lookup(ref)?.toString() ?? "");
			expect(links.some((annot) => annot.includes("/Dest"))).toBe(true);
			expect(links.some((annot) => annot.includes("https://obsidian.md"))).toBe(true);

			expect(headings.length).toBeGreaterThan(0);
			const outline = doc.catalog.lookup(PDFName.of("Outlines"), PDFDict);
			const first = outline.lookup(PDFName.of("First"), PDFDict);
			expect(first.lookup(PDFName.of("Title"), PDFHexString).decodeText()).toBe(headings[0]?.title);
		} finally {
			await browser.close();
		}
	});
});
