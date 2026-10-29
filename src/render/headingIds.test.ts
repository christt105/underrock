// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { assignHeadingIds, slugify } from "./headingIds";

describe("slugify", () => {
	it("lowercases, strips accents and punctuation and joins words with dashes", () => {
		expect(slugify("  Introducción: ¿qué es esto?  ")).toBe("introduccion-que-es-esto");
	});

	it("keeps non-Latin letters and digits", () => {
		expect(slugify("第2章 Résumé")).toBe("第2章-resume");
	});

	it("falls back to a generic id when nothing is left", () => {
		expect(slugify("!!!")).toBe("section");
	});
});

describe("assignHeadingIds", () => {
	it("gives repeated headings unique ids and maps the first one by text", () => {
		const root = document.createElement("div");
		root.innerHTML = '<h1 data-heading="Notes">Notes</h1><h2>Notes</h2><h3>Other</h3>';
		const ids = assignHeadingIds(root);
		expect(Array.from(root.querySelectorAll("h1, h2, h3")).map((h) => h.id)).toEqual(["notes", "notes-1", "other"]);
		expect(ids.get("Notes")).toBe("notes");
		expect(ids.get("Other")).toBe("other");
	});
});
