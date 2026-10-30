import { afterAll, describe, expect, it } from "vitest";
import type { Locator } from "playwright";
import { closeBrowser, paginate } from "../testing/paginate";
import { longDocument } from "../testing/sampleContent";
import { DEFAULT_HEADER_FOOTER } from "./HeaderFooter";
import { marginBoxesCss } from "./marginBoxesCss";

afterAll(closeBrowser);

/** The generated `content` of a margin box. Counters only resolve when painted, so this reads the rule itself. */
function generatedContent(box: Locator): Promise<string> {
	return box.evaluate((el) => getComputedStyle(el.querySelector(".pagedjs_margin-content") ?? el, "::after").content);
}

describe("page margins", () => {
	it("show the page number, the current section and nothing on the first page when asked", async () => {
		const css = marginBoxesCss(
			{ ...DEFAULT_HEADER_FOOTER, pageNumberFormat: "{page} / {pages}", header: "{section}", onFirstPage: false },
			{ title: "Title", date: "Date" },
		);
		const page = await paginate(longDocument(40), { extraCss: [css] });
		const pages = page.locator(".pagedjs_page");
		expect(await pages.count()).toBeGreaterThan(3);

		const second = pages.nth(1);
		expect(await generatedContent(second.locator(".pagedjs_margin-bottom-center"))).toBe('counter(page) " / " counter(pages)');
		expect(await second.locator(".pagedjs_margin-top-right").ariaSnapshot()).toMatch(/text: Section \d+/);

		const first = pages.first();
		expect(await generatedContent(first.locator(".pagedjs_margin-bottom-center"))).toBe("none");
		await page.close();
	});
});
