// @vitest-environment happy-dom
import { beforeAll, describe, expect, it } from "vitest";
import { stubObsidianDom } from "../testing/obsidianDom";
import { placeFootnotesOnPages } from "./footnotes";

beforeAll(stubObsidianDom);

const ref = (id: string, n: string) =>
	`<sup class="footnote-ref" data-footnote-id="${id}"><a class="footnote-link" href="#fn-${n}" data-footref="x">[${n}]</a></sup>`;
const item = (n: string, html: string) =>
	`<li data-footnote-id="fn-${n}"><p>${html} <a class="footnote-backref footnote-link" href="#fnref-${n}">↩︎</a></p></li>`;

function place(html: string): HTMLElement {
	const root = document.createElement("div");
	root.innerHTML = html;
	placeFootnotesOnPages(root);
	return root;
}

describe("placeFootnotesOnPages", () => {
	it("moves each footnote's text to where it is cited and drops the list at the end", () => {
		const root = place(
			`<p>Calor${ref("fnref-1", "1")} y entropía${ref("fnref-2", "2")}.</p>` +
				`<section class="footnotes"><hr><ol>${item("1", "Del cuerpo caliente al <em>frío</em>.")}${item("2", "Siempre aumenta.")}</ol></section>`,
		);
		expect(root.querySelector("section.footnotes")).toBeNull();
		expect(root.querySelector("sup.footnote-ref")).toBeNull();
		const notes = Array.from(root.querySelectorAll("p > span.underrock-footnote"));
		expect(notes.map((n) => n.textContent?.trim())).toEqual(["Del cuerpo caliente al frío.", "Siempre aumenta."]);
		expect(notes[0].querySelector("em")).not.toBeNull();
		expect(root.querySelector(".footnote-backref")).toBeNull();
		expect(root.querySelector("p")?.textContent?.startsWith("Calor" + "Del cuerpo")).toBe(true);
	});

	it("cites a footnote again with its number only", () => {
		const root = place(
			`<p>Uno${ref("fnref-1", "1")} y otra vez${ref("fnref-1-1", "1-1")}.</p>` +
				`<section class="footnotes"><hr><ol>${item("1", "La nota.")}</ol></section>`,
		);
		expect(root.querySelectorAll(".underrock-footnote")).toHaveLength(1);
		expect(root.querySelector("sup.underrock-footnote-ref")?.textContent).toBe("1");
	});

	it("keeps footnotes from different references apart, like 1 and 10", () => {
		const items = Array.from({ length: 10 }, (_, i) => item(String(i + 1), `Nota ${i + 1}`)).join("");
		const refs = Array.from({ length: 10 }, (_, i) => ref(`fnref-${i + 1}`, String(i + 1))).join("");
		const root = place(`<p>${refs}</p><section class="footnotes"><hr><ol>${items}</ol></section>`);
		expect(Array.from(root.querySelectorAll(".underrock-footnote")).map((n) => n.textContent?.trim())).toEqual(
			Array.from({ length: 10 }, (_, i) => `Nota ${i + 1}`),
		);
	});

	it("does nothing without footnotes", () => {
		expect(place("<p>Sin notas</p>").innerHTML).toBe("<p>Sin notas</p>");
	});
});
