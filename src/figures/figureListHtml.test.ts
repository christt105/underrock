import { describe, expect, it } from "vitest";
import { DEFAULT_FIGURE_LIST } from "./FigureListSettings";
import { figureListHtml } from "./figureListHtml";

const FIGURES = [
	{ id: "figure-bloch", label: "Figura 1", description: "Esfera de Bloch & <qubit>", blockId: "bloch" },
	{ id: "underrock-figure-2", label: "Figura 2", description: "", blockId: "" },
];

describe("figureListHtml", () => {
	it("lists every figure with its label and description, linking to it", () => {
		const html = figureListHtml(FIGURES, DEFAULT_FIGURE_LIST);
		expect(html).toContain('<p class="underrock-figure-list-title">List of figures</p>');
		expect(html).toContain(
			'<a href="#figure-bloch"><span class="underrock-figure-list-label">Figura 1</span> <span class="underrock-figure-list-description">Esfera de Bloch &amp; &lt;qubit&gt;</span></a>',
		);
		expect(html).toContain('<a href="#underrock-figure-2"><span class="underrock-figure-list-label">Figura 2</span></a>');
		expect(html.indexOf("figure-bloch")).toBeLessThan(html.indexOf("underrock-figure-2"));
	});

	it("drops an empty title", () => {
		expect(figureListHtml(FIGURES, { ...DEFAULT_FIGURE_LIST, title: " " })).not.toContain("underrock-figure-list-title");
	});

	it("is empty without figures", () => {
		expect(figureListHtml([], DEFAULT_FIGURE_LIST)).toBe("");
	});
});
