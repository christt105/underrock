import { afterAll, describe, expect, it } from "vitest";
import type { Page } from "playwright";
import { closeBrowser, paginate } from "../testing/paginate";
import { longDocument, words } from "../testing/sampleContent";

afterAll(closeBrowser);

const MM_TO_PX = 96 / 25.4;

function pageCount(page: Page): Promise<number> {
	return page.locator(".pagedjs_page").count();
}

/** Tag of the last block on each page except the last one. */
function lastBlockPerPage(page: Page): Promise<string[]> {
	return page.$$eval(".pagedjs_page", (pages) =>
		pages.slice(0, -1).map((p) => {
			const blocks = p.querySelectorAll(".pagedjs_page_content :is(h1, h2, h3, h4, h5, h6, p, li, pre, table, blockquote)");
			return blocks[blocks.length - 1]?.tagName ?? "";
		}),
	);
}

function pageIndexOf(page: Page, selector: string): Promise<number> {
	return page.$$eval(".pagedjs_page", (pages, sel) => pages.findIndex((p) => p.querySelector(sel) !== null), selector);
}

describe("pagination", () => {
	it("lays out A4 pages by default", async () => {
		const page = await paginate(longDocument(10));
		const box = await page.locator(".pagedjs_page").first().boundingBox();
		expect(box?.width).toBeCloseTo(210 * MM_TO_PX, 0);
		expect(box?.height).toBeCloseTo(297 * MM_TO_PX, 0);
		await page.close();
	});

	it("never leaves a heading alone at the bottom of a page", async () => {
		const page = await paginate(longDocument(120));
		expect(await pageCount(page)).toBeGreaterThan(5);
		const last = await lastBlockPerPage(page);
		expect(last.filter((tag) => /^H[1-6]$/.test(tag))).toEqual([]);
		await page.close();
	});

	it("starts a new page after a manual page break", async () => {
		const page = await paginate(`<p>${words(20, 1)}</p><div class="page-break"></div><h2 id="after">After</h2><p>${words(20, 2)}</p>`);
		expect(await pageCount(page)).toBe(2);
		expect(await pageIndexOf(page, "#after")).toBe(1);
		await page.close();
	});

	it("keeps short code blocks and table rows on one page", async () => {
		const code = `<pre class="underrock-short"><code>${"const x = 1;\n".repeat(12)}</code></pre>`;
		const rows = Array.from({ length: 30 }, (_, i) => `<tr><td>${i}</td><td>${words(25, i)}</td></tr>`).join("");
		const filler = Array.from({ length: 12 }, (_, i) => `<p>${words(40 + i * 7, i)}</p>${code}`).join("");
		const page = await paginate(`${filler}<table><tbody>${rows}</tbody></table>${filler}`);
		expect(await page.locator("pre.underrock-short[data-split-to]").count()).toBe(0);
		expect(await page.locator("tr[data-split-to]").count()).toBe(0);
		await page.close();
	});

	it("does not leave a single line of a paragraph on either side of a page break", async () => {
		const page = await paginate(longDocument(120));
		const fragments = await page.$$eval("p[data-split-to], p[data-split-from]", (ps) =>
			ps.map((p) => Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight))),
		);
		expect(fragments.length).toBeGreaterThan(0);
		expect(fragments.filter((lines) => lines < 2)).toEqual([]);
		await page.close();
	});

	it("prints to a PDF with the same pages and page size", async () => {
		const page = await paginate(longDocument(60));
		const pages = await pageCount(page);
		const pdf = (await page.pdf({ preferCSSPageSize: true, printBackground: true })).toString("latin1");
		expect(pdf.match(/\/Type\s*\/Page(?!s)/g)).toHaveLength(pages);
		const [width, height] = (/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\s*\]/.exec(pdf) ?? []).slice(1).map(Number);
		expect(width).toBeCloseTo((210 / 25.4) * 72, 0);
		expect(height).toBeCloseTo((297 / 25.4) * 72, 0);
		await page.close();
	});
});
