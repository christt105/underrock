import { describe, expect, it } from "vitest";
import { coverHtml } from "./coverHtml";

describe("coverHtml", () => {
	it("shows title, author and date, escaped", () => {
		const html = coverHtml({ title: "Notes <draft> & more", author: "Ana", date: "30 October 2026" });
		expect(html).toBe(
			'<section class="underrock-cover"><p class="underrock-cover-title">Notes &lt;draft&gt; &amp; more</p>' +
				'<p class="underrock-cover-author">Ana</p><p class="underrock-cover-date">30 October 2026</p></section>',
		);
	});

	it("leaves out a missing author", () => {
		expect(coverHtml({ title: "T", date: "D" })).not.toContain("author");
		expect(coverHtml({ title: "T", author: " ", date: "D" })).not.toContain("author");
	});
});
