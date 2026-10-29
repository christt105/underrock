import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { PDFDocument } from "pdf-lib";
import { chromium } from "playwright";
import { afterAll, describe, expect, it } from "vitest";
import { buildPagedDocument } from "../../pagination/buildPagedDocument";
import { DEFAULT_PAGE_SETUP } from "../../pagination/PageSetup";
import { setPdfMetadata } from "../../pdf/setPdfMetadata";
import { OBSIDIAN_FIXTURE } from "../../testing/obsidianFixture";
import { WAIT_FOR_PAGINATION } from "./printHtmlToPdf";

const dir = mkdtempSync(join(tmpdir(), "underrock-print-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("printing a paged document", () => {
	it("loads from a file, waits for pagination and prints a PDF with embedded fonts, metadata and links", async () => {
		const html = buildPagedDocument(
			{ title: "Sample", html: OBSIDIAN_FIXTURE, mathCss: "" },
			{ page: DEFAULT_PAGE_SETUP, lang: "en", baseUrl: "about:blank", extraCss: [] },
		);
		const file = join(dir, "print.html");
		writeFileSync(file, html);

		const browser = await chromium.launch();
		try {
			const page = await browser.newPage();
			await page.goto(pathToFileURL(file).href);
			await page.evaluate(WAIT_FOR_PAGINATION);
			const pages = await page.locator(".pagedjs_page").count();
			const printed = await page.pdf({ preferCSSPageSize: true, printBackground: true });

			expect(Buffer.from(printed).toString("latin1")).toMatch(/\/FontFile[23]?\b/);

			const pdf = await setPdfMetadata(printed, { title: "Sample", author: "Someone", language: "es" });
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
		} finally {
			await browser.close();
		}
	});
});
