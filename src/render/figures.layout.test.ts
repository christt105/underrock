import { afterAll, describe, expect, it } from "vitest";
import { closeBrowser, paginate } from "../testing/paginate";

afterAll(closeBrowser);

/** A plain image of the given natural size, like a screenshot. */
function image(naturalWidth: number, size?: number): string {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${naturalWidth}" height="200"><rect width="100%" height="100%" fill="gray"/></svg>`;
	const width = size === undefined ? "" : ` width="${size}"`;
	return `<img src="data:image/svg+xml,${encodeURIComponent(svg)}"${width}>`;
}

function figure(images: string[]): string {
	const subfigures = images.map((img, i) => `<figure class="underrock-subfigure">${img}<figcaption>(${"abc"[i]})</figcaption></figure>`);
	return `<figure class="underrock-figure"><div class="underrock-figure-row">${subfigures.join("")}</div><figcaption>Figure 1</figcaption></figure>`;
}

/** Each image's width and the row it landed on, counting from 0. */
async function layout(images: string[]): Promise<{ widths: number[]; rows: number[]; rowWidth: number }> {
	const page = await paginate(figure(images));
	const result = await page.evaluate(() => {
		const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".underrock-subfigure img"));
		const tops = imgs.map((img) => Math.round(img.closest("figure")!.getBoundingClientRect().top));
		const distinct = Array.from(new Set(tops)).sort((a, b) => a - b);
		return {
			widths: imgs.map((img) => Math.round(img.getBoundingClientRect().width)),
			rows: tops.map((top) => distinct.indexOf(top)),
			rowWidth: document.querySelector(".underrock-figure-row")!.getBoundingClientRect().width,
		};
	});
	await page.close();
	return result;
}

describe("side-by-side images", () => {
	it("keep the size the user gave them and fit as many on a row as they can", async () => {
		const { widths, rows } = await layout([image(800, 150), image(800, 150), image(800, 150)]);
		expect(widths).toEqual([150, 150, 150]);
		expect(rows).toEqual([0, 0, 0]);
	});

	it("go below, at their size, when they don't fit beside the others", async () => {
		const { widths, rows } = await layout([image(800, 400), image(800, 400)]);
		expect(widths).toEqual([400, 400]);
		expect(rows).toEqual([0, 1]);
	});

	it("never grow wider than the page", async () => {
		const { widths, rowWidth } = await layout([image(3000, 3000), image(800, 100)]);
		expect(widths[0]).toBeLessThanOrEqual(Math.ceil(rowWidth));
		expect(widths[1]).toBe(100);
	});

	it("take half the width each without a size, the third going below at the same width", async () => {
		const { widths, rows } = await layout([image(800), image(800), image(800)]);
		expect(rows).toEqual([0, 0, 1]);
		expect(widths[1]).toBe(widths[0]);
		expect(widths[2]).toBe(widths[0]);
	});
});
