import { describe, expect, it } from "vitest";
import { DEFAULT_TOC } from "./TocSettings";
import { tocHtml } from "./tocHtml";

const HEADINGS = [
	{ level: 2, text: "Intro & <scope>", id: "intro" },
	{ level: 3, text: "Detail", id: "detail" },
	{ level: 4, text: "Too deep", id: "deep" },
	{ level: 2, text: "End", id: "end" },
];

describe("tocHtml", () => {
	it("lists headings up to the depth, indented from the shallowest level", () => {
		const html = tocHtml(HEADINGS, DEFAULT_TOC);
		expect(html).toContain('<p class="underrock-toc-title">Contents</p>');
		expect(html).toContain('<li class="underrock-toc-entry" data-depth="0"><a href="#intro">Intro &amp; &lt;scope&gt;</a></li>');
		expect(html).toContain('<li class="underrock-toc-entry" data-depth="1"><a href="#detail">Detail</a></li>');
		expect(html).not.toContain("#deep");
		expect(html.indexOf("#intro")).toBeLessThan(html.indexOf("#end"));
	});

	it("clamps the depth and drops an empty title", () => {
		const html = tocHtml(HEADINGS, { ...DEFAULT_TOC, depth: 9, title: " " });
		expect(html).toContain("#deep");
		expect(html).not.toContain("underrock-toc-title");
	});

	it("is empty without headings", () => {
		expect(tocHtml([], DEFAULT_TOC)).toBe("");
	});
});
