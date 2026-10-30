import { chromium } from "playwright";
import { describe, expect, it } from "vitest";
import { buildPagedDocument } from "../pagination/buildPagedDocument";
import { DEFAULT_PAGE_SETUP } from "../pagination/PageSetup";
import { PAGE_COUNT_ATTRIBUTE } from "../pagination/pagedScripts";
import { longDocument } from "../testing/sampleContent";

describe("preview frame", () => {
	it("paginates inside a srcdoc iframe, zooms with CSS zoom and finds the page in view", async () => {
		const html = buildPagedDocument(
			{ title: "Preview", html: longDocument(60), mathCss: "" },
			{ page: DEFAULT_PAGE_SETUP, lang: "en", baseUrl: "about:blank", extraCss: [] },
		);
		const browser = await chromium.launch();
		try {
			const page = await browser.newPage({ viewport: { width: 600, height: 800 } });
			await page.setContent('<iframe style="width: 600px; height: 800px; border: 0"></iframe>');
			await page.$eval("iframe", (frame, srcdoc) => (frame.srcdoc = srcdoc), html);
			const frame = page.frames()[1];
			if (frame === undefined) throw new Error("no frame");
			await frame.waitForSelector(`html[${PAGE_COUNT_ATTRIBUTE}]`, { timeout: 30000 });

			const pageWidth = await frame.$eval(".pagedjs_page", (el) => (el as HTMLElement).offsetWidth);
			const zoom = (600 - 32) / pageWidth;
			await frame.evaluate((z) => document.documentElement.style.setProperty("zoom", String(z)), zoom);
			const box = await frame.locator(".pagedjs_page").first().boundingBox();
			expect(box?.width).toBeCloseTo(600 - 32, -1);

			await frame.evaluate(() => {
				const third = document.querySelector<HTMLElement>('.pagedjs_page[data-page-number="3"]');
				third?.scrollIntoView();
			});
			const current = await frame.evaluate(
				() => document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest(".pagedjs_page")?.getAttribute("data-page-number"),
			);
			expect(current).toBe("3");
		} finally {
			await browser.close();
		}
	});
});
