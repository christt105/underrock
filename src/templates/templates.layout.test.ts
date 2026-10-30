import { afterAll, describe, expect, it } from "vitest";
import { closeBrowser, paginate } from "../testing/paginate";
import { words } from "../testing/sampleContent";
import { DEFAULT_TOC } from "../toc/TocSettings";
import { tocHtml } from "../toc/tocHtml";
import { DEFAULT_TYPOGRAPHY } from "../typography/Typography";
import { typographyCss } from "../typography/typographyCss";
import { BUILT_IN_TEMPLATES } from "./builtInTemplates";

afterAll(closeBrowser);

const CHAPTERS = [1, 2, 3].map((n) => `<h1 id="c${n}">Chapter ${n}</h1><p>${words(60, n)}</p>`).join("");

function template(name: string): string {
	return BUILT_IN_TEMPLATES.get(name) ?? "";
}

describe("templates", () => {
	it("report starts each chapter on a new page, without a blank page after the table of contents", async () => {
		const toc = tocHtml([1, 2, 3].map((n) => ({ level: 1, text: `Chapter ${n}`, id: `c${n}` })), DEFAULT_TOC);
		const page = await paginate(CHAPTERS, { extraCss: [template("report")], leadingHtml: [toc] });
		const layout = await page.$$eval(".pagedjs_page", (pages) =>
			pages.map((p) => p.querySelector(".pagedjs_page_content h1")?.textContent ?? (p.querySelector(".underrock-toc") ? "toc" : "")),
		);
		expect(layout).toEqual(["toc", "Chapter 1", "Chapter 2", "Chapter 3"]);
		await page.close();
	});

	it("minimal changes the base style, and settings changed by the user still win", async () => {
		const page = await paginate(CHAPTERS, {
			extraCss: [template("minimal"), typographyCss({ ...DEFAULT_TYPOGRAPHY, h1Size: 30 })],
		});
		const style = await page.evaluate(() => {
			const h1 = getComputedStyle(document.querySelector("h1") as Element);
			const p = getComputedStyle(document.querySelector("p") as Element);
			return { font: h1.fontFamily, size: h1.fontSize, body: p.fontSize };
		});
		expect(style.font).toContain("sans-serif");
		expect(style.size).toBe("40px");
		expect(style.body).toBe("14px");
		await page.close();
	});

	it("article is the base style", async () => {
		const page = await paginate(CHAPTERS, { extraCss: [template("article")] });
		expect(await page.locator(".pagedjs_page").count()).toBe(1);
		await page.close();
	});
});
