import { afterAll, describe, expect, it } from "vitest";
import { closeBrowser, paginate } from "../testing/paginate";
import { longDocument } from "../testing/sampleContent";

afterAll(closeBrowser);

describe("page footnotes", () => {
	it("sit at the bottom of the page that cites them, numbered through the document", async () => {
		const cited = (n: number) => `<p>Paragraph ${n} cites a note<span class="underrock-footnote">Note ${n}.</span> here.</p>`;
		const body = [cited(1), longDocument(14), cited(2), cited(3), longDocument(14)].join("\n");
		const page = await paginate(body);
		const notes = await page.evaluate(() =>
			Array.from(document.querySelectorAll(".pagedjs_footnote_area .underrock-footnote")).map((note) => {
				const call = document.querySelector(`[data-footnote-call="${note.getAttribute("data-footnote-call")}"]:not(.underrock-footnote)`);
				return {
					text: note.textContent?.trim(),
					page: note.closest(".pagedjs_page")?.getAttribute("data-page-number"),
					callPage: call?.closest(".pagedjs_page")?.getAttribute("data-page-number"),
					callNumber: call ? getComputedStyle(call, "::after").content : null,
				};
			}),
		);
		expect(notes.map((n) => n.text)).toEqual(["Note 1.", "Note 2.", "Note 3."]);
		for (const note of notes) expect(note.page).toBe(note.callPage);
		expect(notes[0].page).toBe("1");
		expect(Number(notes[1].page)).toBeGreaterThan(1);
		expect(notes.map((n) => n.callNumber)).toEqual(['"1"', '"2"', '"3"']);
		await page.close();
	});
});
