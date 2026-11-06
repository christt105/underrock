import { afterAll, describe, expect, it } from "vitest";
import type { Locator } from "playwright";
import { DEFAULT_HEADER_FOOTER } from "../running/HeaderFooter";
import { marginBoxesCss } from "../running/marginBoxesCss";
import { closeBrowser, paginate } from "../testing/paginate";
import { longDocument } from "../testing/sampleContent";
import { coverHtml } from "./coverHtml";

afterAll(closeBrowser);

function generatedContent(box: Locator): Promise<string> {
	return box.evaluate((el) => getComputedStyle(el.querySelector(".pagedjs_margin-content") ?? el, "::after").content);
}

describe("cover page", () => {
	it("takes the first page alone, without page number, header or footer", async () => {
		const css = marginBoxesCss({ ...DEFAULT_HEADER_FOOTER, header: "{title}", footer: "Footer" }, { title: "Title", date: "Date" });
		const page = await paginate(longDocument(20), {
			extraCss: [css],
			leadingHtml: [coverHtml({ title: "A long report", author: "Ana", date: "30 October 2026" })],
		});
		const pages = page.locator(".pagedjs_page");
		const first = pages.first();
		expect(await first.locator(".pagedjs_page_content").innerText()).toBe("A long report\n\nAna\n\n30 October 2026");
		for (const slot of ["bottom-center", "top-right", "bottom-left"]) {
			expect(await generatedContent(first.locator(`.pagedjs_margin-${slot}`))).toBe("none");
		}

		const second = pages.nth(1);
		expect(await second.locator(".pagedjs_page_content h1").first().innerText()).toBe("Section 0");
		expect(await generatedContent(second.locator(".pagedjs_margin-bottom-center"))).toBe("counter(page)");
		expect(await generatedContent(second.locator(".pagedjs_margin-top-right"))).toBe('"Title"');
		await page.close();
	});
});
