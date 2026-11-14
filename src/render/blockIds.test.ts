import { describe, expect, it } from "vitest";
import { markBlockIds } from "./blockIds";

const marker = (id: string) => `<span data-underrock-block-id="${id}"></span>`;

describe("markBlockIds", () => {
	it("marks a block id at the end of a line of text", () => {
		expect(markBlockIds("![[a.png]]\nElectronic adapter circuit ^circuit")).toBe(`![[a.png]]\nElectronic adapter circuit ${marker("circuit")}`);
	});

	it("marks a block id on its own line right after an image", () => {
		expect(markBlockIds("![[a.png]]\n![[b.png]]\n^pair")).toBe(`![[a.png]]\n![[b.png]]\n${marker("pair")}`);
	});

	it("marks a block id on its own line right after display math", () => {
		expect(markBlockIds("$$\ndS > 0\n$$\n^entropia")).toBe(`$$\ndS > 0\n$$\n${marker("entropia")}`);
		expect(markBlockIds("$$dS \\ge 0$$\n^segunda")).toBe(`$$dS \\ge 0$$\n${marker("segunda")}`);
		expect(markBlockIds("$$dS \\ge 0$$ ^segunda")).toBe(`$$dS \\ge 0$$ ${marker("segunda")}`);
	});

	it("leaves a lone block id after anything else alone", () => {
		expect(markBlockIds("| a | b |\n| - | - |\n^table")).toBe("| a | b |\n| - | - |\n^table");
	});

	it("leaves code, math, superscripts and footnotes alone", () => {
		const markdown = "```\nx ^code\n```\n~~~~\n```\ny ^code\n~~~~\n$$\na ^2\n$$\nx^2 and a note[^1]";
		expect(markBlockIds(markdown)).toBe(markdown);
	});

	it("does not take inline code or one-line math at the start of a line for a block", () => {
		const markdown = "````inline code````\n$$x^2$$\n![[a.png]]\nCaption ^fig";
		expect(markBlockIds(markdown)).toBe("````inline code````\n$$x^2$$\n![[a.png]]\nCaption " + marker("fig"));
	});
});
