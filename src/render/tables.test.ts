// @vitest-environment happy-dom
import { beforeAll, describe, expect, it } from "vitest";
import { stubObsidianDom } from "../testing/obsidianDom";
import { captionTables } from "./tables";

beforeAll(stubObsidianDom);

const TABLE = "<table><thead><tr><th>Type</th></tr></thead><tbody><tr><td>Link</td></tr></tbody></table>";
const id = (name: string) => `<span data-underrock-block-id="${name}"></span>`;

function caption(html: string, lang = "es"): { root: HTMLElement; entries: ReturnType<typeof captionTables> } {
	const root = document.createElement("div");
	root.innerHTML = html;
	const entries = captionTables(root, lang);
	return { root, entries };
}

describe("captionTables", () => {
	it("turns a 'Tabla:' line above a table into its numbered caption, in the document language", () => {
		const { root, entries } = caption(`<p>Tabla: Túneles de <strong>backup</strong> ${id("global")}</p>${TABLE}`);
		const captionEl = root.querySelector("table > caption");
		expect(captionEl?.textContent?.trim()).toBe("Tabla 1: Túneles de backup");
		expect(captionEl?.querySelector("strong")).not.toBeNull();
		expect(root.querySelector("p")).toBeNull();
		expect(root.querySelector("table")?.id).toBe("table-global");
		expect(entries).toEqual([{ id: "table-global", label: "Tabla 1", blockId: "global" }]);
	});

	it("accepts 'Table:' in any language and numbers only the tables with a caption", () => {
		const { root, entries } = caption(`<p>table:First</p>${TABLE}${TABLE}<p>Tabla: Third</p>${TABLE}`);
		expect(Array.from(root.querySelectorAll("caption"), (c) => c.textContent)).toEqual(["Tabla 1: First", "Tabla 2: Third"]);
		expect(entries.map((e) => e.id)).toEqual(["underrock-table-1", "underrock-table-2"]);
	});

	it("finds a table inside a plugin's wrapper", () => {
		const { root } = caption(`<p>Table: Wrapped</p><div class="sheets-table-scroll">${TABLE}</div>`, "en");
		expect(root.querySelector("caption")?.textContent).toBe("Table 1: Wrapped");
	});

	it("leaves paragraphs that don't start with the word, or that come after the table, alone", () => {
		const { root, entries } = caption(`<p>The table below</p>${TABLE}${TABLE}<p>Tabla: after</p>`);
		expect(root.querySelector("caption")).toBeNull();
		expect(root.querySelectorAll("p")).toHaveLength(2);
		expect(entries).toEqual([]);
	});
});
