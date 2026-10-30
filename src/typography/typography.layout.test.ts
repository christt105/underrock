import { afterAll, describe, expect, it } from "vitest";
import { closeBrowser, paginate } from "../testing/paginate";
import { longDocument } from "../testing/sampleContent";
import { DEFAULT_TYPOGRAPHY } from "./Typography";
import { typographyCss } from "./typographyCss";

afterAll(closeBrowser);

describe("typography settings", () => {
	it("reach the paginated pages", async () => {
		const css = typographyCss({
			...DEFAULT_TYPOGRAPHY,
			bodyFont: "monospace",
			bodySize: 14,
			h1Size: 30,
			lineHeight: 2,
			textColor: "#222222",
			headingColor: "#ff0000",
		});
		const page = await paginate(longDocument(20), { extraCss: [css] });
		const styles = await page.evaluate(() => {
			const p = document.querySelector(".pagedjs_page_content p");
			const h1 = document.querySelector(".pagedjs_page_content h1");
			if (!p || !h1) return null;
			return {
				pFont: getComputedStyle(p).fontFamily,
				pSize: getComputedStyle(p).fontSize,
				pLineHeight: getComputedStyle(p).lineHeight,
				pColor: getComputedStyle(p).color,
				h1Size: getComputedStyle(h1).fontSize,
				h1Color: getComputedStyle(h1).color,
			};
		});
		expect(styles).toEqual({
			pFont: "monospace",
			pSize: "18.6667px",
			pLineHeight: "37.3333px",
			pColor: "rgb(34, 34, 34)",
			h1Size: "40px",
			h1Color: "rgb(255, 0, 0)",
		});
		await page.close();
	});
});
