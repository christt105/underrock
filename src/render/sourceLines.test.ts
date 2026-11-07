import { describe, expect, it } from "vitest";
import { markSourceLines } from "./sourceLines";

const mark = (n: number) => `<span data-underrock-line="${n}"></span>`;

describe("markSourceLines", () => {
	it("ends each line of text with its line number, counting from the first line given", () => {
		expect(markSourceLines("First line\nsecond line\n\n- item\n  continued", 3)).toBe(
			`First line${mark(3)}\nsecond line${mark(4)}\n\n- item${mark(6)}\n  continued${mark(7)}`,
		);
	});

	it("keeps hard line breaks working", () => {
		expect(markSourceLines("two spaces  \nbackslash\\\nend", 0)).toBe(`two spaces${mark(0)}  \nbackslash${mark(1)}\\\nend${mark(2)}`);
	});

	it("leaves headings, rules, callout titles, code, math and tables alone", () => {
		const markdown = [
			"# Heading",
			"Setext heading",
			"---",
			"***",
			"> [!note] Title",
			"> In the callout",
			"```",
			"code",
			"```",
			"$$",
			"x^2",
			"$$",
			"$$y$$",
			"| a | b |",
			"| - | - |",
			"| 1 | 2 |",
			"",
			"After",
		].join("\n");
		const marked = markSourceLines(markdown, 0).split("\n");
		expect(marked.filter((line) => line.includes("data-underrock-line"))).toEqual([`> In the callout${mark(5)}`, `After${mark(17)}`]);
	});

	it("leaves indented code alone but marks indented list continuations", () => {
		expect(markSourceLines("Text\n\n    code", 0)).toBe(`Text${mark(0)}\n\n    code`);
		expect(markSourceLines("- item\n\n    more of the item", 0)).toBe(`- item${mark(0)}\n\n    more of the item${mark(2)}`);
	});
});
