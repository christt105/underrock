import { afterAll, describe, expect, it } from "vitest";
import type { Page } from "playwright";
import { closeBrowser, paginate } from "../testing/paginate";
import { OBSIDIAN_FIXTURE } from "../testing/obsidianFixture";
import { longDocument, words } from "../testing/sampleContent";

afterAll(closeBrowser);

const MM_TO_PX = 96 / 25.4;

/** Font and size combinations that used to leave single lines or lone headings before the line-control hook. */
const TYPESETTINGS: [string, string][] = [
	["default", ""],
	["serif 12pt", ":root { --ur-font-body: serif; --ur-size-body: 12pt; }"],
	["Liberation Serif 10pt", ':root { --ur-font-body: "Liberation Serif"; --ur-size-body: 10pt; }'],
	["sans-serif 11pt", ":root { --ur-font-body: sans-serif; --ur-size-body: 11pt; }"],
	["monospace 11pt, line height 1.8", ":root { --ur-font-body: monospace; --ur-size-body: 11pt; --ur-line-height: 1.8; }"],
];

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

	it.each(TYPESETTINGS)("never leaves a heading alone at the bottom of a page (%s)", async (_, css) => {
		const page = await paginate(longDocument(120), { extraCss: [css] });
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

	it("never leaves a callout title alone at the bottom of a page", async () => {
		const callout = (i: number) =>
			`<div class="callout" data-callout="note"><div class="callout-title"><div class="callout-title-inner">Note ${i}</div></div><div class="callout-content"><p>${words(8, i)}</p></div></div>`;
		const body = Array.from({ length: 60 }, (_, i) => `<p>${words(20 + ((i * 17) % 90), i)}</p>${callout(i)}`).join("");
		const page = await paginate(body);
		const lonelyTitles = await page.$$eval(".callout", (callouts) =>
			callouts.filter((c) => c.querySelector(".callout-title") && (c.querySelector(".callout-content")?.textContent ?? "").trim() === "").length,
		);
		expect(lonelyTitles).toBe(0);
		await page.close();
	});

	it.each(TYPESETTINGS)("does not leave a single line of a paragraph on either side of a page break (%s)", async (_, css) => {
		const page = await paginate(longDocument(120), { extraCss: [css] });
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

	it("fits every element of a typical note inside the page and expands folded callouts", async () => {
		const page = await paginate(OBSIDIAN_FIXTURE);
		const overflowing = await page.$$eval(".pagedjs_page", (pages) =>
			pages.flatMap((p) => {
				const area = p.querySelector(".pagedjs_area")?.getBoundingClientRect();
				if (area === undefined) return [];
				const blocks = ":is(h1, h2, h3, h4, h5, h6, ul, ol, table, pre, blockquote, .callout, .math-block, img, svg):not([data-split-to])";
				return Array.from(p.querySelectorAll(`.pagedjs_page_content ${blocks}`))
					.filter((el) => el.getBoundingClientRect().right > area.right + 1)
					.map((el) => el.tagName);
			}),
		);
		expect(overflowing).toEqual([]);
		expect(await page.locator(".callout.is-collapsed .callout-content p").isVisible()).toBe(true);
		await page.close();
	});
});
