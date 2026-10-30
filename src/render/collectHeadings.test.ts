// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { collectHeadings } from "./collectHeadings";

describe("collectHeadings", () => {
	it("lists headings with an id in document order", () => {
		const root = document.createElement("div");
		root.innerHTML = '<h1 id="a"> Intro </h1><p>x</p><h3 id="b">Deep</h3><h2>No id</h2><div><h2 id="c">Nested</h2></div>';
		expect(collectHeadings(root)).toEqual([
			{ level: 1, text: "Intro", id: "a" },
			{ level: 3, text: "Deep", id: "b" },
			{ level: 2, text: "Nested", id: "c" },
		]);
	});
});
