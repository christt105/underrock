import { afterAll, describe, expect, it } from "vitest";
import { closeBrowser, paginate } from "../testing/paginate";
import type { TableLayout } from "./TableLayout";
import { tableLayoutCss } from "./TableLayout";

afterAll(closeBrowser);

const TABLE = "<table><thead><tr><th>Type</th><th>Backup tunnel</th></tr></thead><tbody><tr><td>Link</td><td>LER1 – LSR3 – LER2</td></tr></tbody></table>";

/** The table's gaps to the left and right edges of the text, in pixels. */
async function gaps(layout: TableLayout): Promise<{ left: number; right: number }> {
	const page = await paginate(`<p>Text</p>${TABLE}`, { extraCss: [tableLayoutCss(layout)] });
	const result = await page.evaluate(() => {
		const text = document.querySelector(".pagedjs_page_content p")!.getBoundingClientRect();
		const table = document.querySelector(".pagedjs_page_content table")!.getBoundingClientRect();
		return { left: Math.round(table.left - text.left), right: Math.round(text.right - table.right) };
	});
	await page.close();
	return result;
}

describe("tables", () => {
	it("sit in the middle of the text width by default", async () => {
		const { left, right } = await gaps("center");
		expect(left).toBeGreaterThan(50);
		expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
	});

	it("can sit on the left at their own width", async () => {
		const { left, right } = await gaps("left");
		expect(left).toBe(0);
		expect(right).toBeGreaterThan(50);
	});

	it("can span the text width", async () => {
		expect(await gaps("full")).toEqual({ left: 0, right: 0 });
	});
});
