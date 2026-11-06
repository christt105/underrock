import { afterAll, describe, expect, it } from "vitest";
import type { HeadingEntry } from "../render/HeadingEntry";
import { closeBrowser, paginate } from "../testing/paginate";
import { longDocument } from "../testing/sampleContent";
import { DEFAULT_TOC } from "./TocSettings";
import { tocHtml } from "./tocHtml";

afterAll(closeBrowser);

describe("table of contents", () => {
	it("takes its own page and shows the page each heading landed on", async () => {
		const body = longDocument(40);
		const headings: HeadingEntry[] = Array.from(body.matchAll(/<h(\d) id="([^"]+)">([^<]+)</g), (m) => ({
			level: Number(m[1]),
			id: m[2] ?? "",
			text: m[3] ?? "",
		}));
		const page = await paginate(body, { leadingHtml: [tocHtml(headings, { ...DEFAULT_TOC, depth: 2 })] });

		const result = await page.evaluate(() => {
			const pageOf = (el: Element) => Number(el.closest(".pagedjs_page")?.getAttribute("data-page-number"));
			const tocPages = new Set(Array.from(document.querySelectorAll(".underrock-toc-entry")).map(pageOf));
			const firstHeading = document.querySelector(".pagedjs_page_content h1, .pagedjs_page_content h2");
			const entries = Array.from(document.querySelectorAll<HTMLAnchorElement>(".underrock-toc-entry a")).map((a) => {
				const target = document.getElementById(a.getAttribute("href")?.slice(1) ?? "");
				return { shown: getComputedStyle(a, "::after").counterReset, actual: target ? pageOf(target) : -1 };
			});
			return { tocPages: [...tocPages], firstHeadingPage: firstHeading ? pageOf(firstHeading) : -1, entries };
		});

		expect(result.entries.length).toBeGreaterThan(10);
		expect(result.entries.length).toBe(headings.filter((h) => h.level <= 2).length);
		expect(result.tocPages).toEqual([1]);
		expect(result.firstHeadingPage).toBe(2);
		for (const entry of result.entries) expect(entry.shown).toMatch(new RegExp(`^target-counter-\\S+ ${entry.actual}$`));
		await page.close();
	});
});
