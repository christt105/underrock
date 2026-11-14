import { describe, expect, it } from "vitest";
import { DEFAULT_FIGURE_LIST, DEFAULT_TABLE_LIST } from "./FigureListSettings";
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

	it("lists tables the same way, with a class of their own", () => {
		const tables = [{ id: "table-global", label: "Tabla 1", description: "Túneles de backup", blockId: "global" }];
		const html = figureListHtml(tables, DEFAULT_TABLE_LIST, "table");
		expect(html).toContain('<nav class="underrock-figure-list underrock-table-list"><p class="underrock-figure-list-title">List of tables</p>');
		expect(html).toContain('<a href="#table-global"><span class="underrock-figure-list-label">Tabla 1</span>');
	});

	it("drops an empty title", () => {
		expect(figureListHtml(FIGURES, { ...DEFAULT_FIGURE_LIST, title: " " })).not.toContain("underrock-figure-list-title");
	});

	it("is empty without figures", () => {
		expect(figureListHtml([], DEFAULT_FIGURE_LIST)).toBe("");
	});
});
