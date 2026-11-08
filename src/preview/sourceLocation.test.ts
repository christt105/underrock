// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { clickedWord, findInSource, locateInSource } from "./sourceLocation";
import type { ClickedWord } from "./sourceLocation";

const NOTE = [
	"---",
	"tags: [quantum]",
	"---",
	"# 1. INTRODUCCIÓN",
	"",
	"Las redes convencionales funcionan con un **transmisor**, un receptor y una carretera de datos.",
	"",
	"Por este motivo, las redes **cuánticas** no surgen para reemplazar a las [[Redes clásicas|clásicas]].",
	"Las redes cuánticas son más seguras.",
].join("\n");

function at(source: string, word: string, nth = 0): number {
	let i = -1;
	for (let n = 0; n <= nth; n++) i = source.indexOf(word, i + 1);
	return i;
}

const clicked = (word: string, before: string, after: string, line: number | null = null): ClickedWord => ({ word, before, after, line, file: null });

const marker = (n: number) => `<span data-underrock-line="${n}"></span>`;

function select(node: Node, start: number, end: number): void {
	const range = document.createRange();
	range.setStart(node, start);
	range.setEnd(node, end);
	document.getSelection()?.removeAllRanges();
	document.getSelection()?.addRange(range);
}

describe("findInSource", () => {
	it("finds a word through Markdown syntax around it", () => {
		const range = findInSource(NOTE, clicked("transmisor", "funcionan con un ", ", un receptor"));
		expect(range).toEqual({ from: at(NOTE, "transmisor"), to: at(NOTE, "transmisor") + "transmisor".length });
	});

	it("tells repeated words apart by the words around them", () => {
		expect(findInSource(NOTE, clicked("cuánticas", "Por este motivo, las redes ", " no surgen para"))?.from).toBe(at(NOTE, "cuánticas", 0));
		expect(findInSource(NOTE, clicked("cuánticas", "Las redes ", " son más seguras."))?.from).toBe(at(NOTE, "cuánticas", 1));
	});

	it("ignores case, and accents written as a letter and a mark", () => {
		expect(findInSource(NOTE, clicked("Introducción".normalize("NFD"), "1. ", ""))?.from).toBe(at(NOTE, "INTRODUCCIÓN"));
	});

	it("finds the shown text of a link, not what it points to", () => {
		expect(findInSource(NOTE, clicked("clásicas", "para reemplazar a las ", "."))?.from).toBe(at(NOTE, "clásicas", 1));
		expect(findInSource("See [the docs](https://docs.example) and docs.", clicked("docs", "See the ", " and"))?.from).toBe(9);
	});

	it("is null for words Underrock adds, like figure numbers", () => {
		expect(findInSource(NOTE, clicked("Figura", "", " 1: Esfera"))).toBeNull();
		expect(findInSource(NOTE, clicked(" ", "", ""))).toBeNull();
	});
});

describe("locateInSource", () => {
	const REPEATED = ["El qubit es un 0.", "", "El qubit es un 0.", "Fin."].join("\n");

	it("goes to the marked line, even when the same text is on another line", () => {
		expect(locateInSource(REPEATED, clicked("qubit", "El ", " es un 0.", 2))).toEqual({ from: 22, to: 27 });
		expect(locateInSource(REPEATED, clicked("qubit", "El ", " es un 0.", 0))).toEqual({ from: 3, to: 8 });
	});

	it("goes to the start of the marked line if the word is not on it", () => {
		expect(locateInSource(REPEATED, clicked("Figura", "", "", 3))).toEqual({ from: 37, to: 37 });
	});

	it("searches the whole note without a marked line", () => {
		expect(locateInSource(NOTE, clicked("INTRODUCCIÓN", "1. ", ""))?.from).toBe(at(NOTE, "INTRODUCCIÓN"));
	});
});

describe("clickedWord", () => {
	it("reads the selected word, the text around it in its block, and the line in the marker after it", () => {
		document.body.innerHTML = `<p>Before${marker(1)}</p><p>Las redes <strong>cuánticas</strong>${marker(7)}<br>son más seguras.${marker(8)}</p>`;
		select(document.querySelector("strong")?.firstChild as Node, 0, "cuánticas".length);
		expect(clickedWord(document)).toEqual({ word: "cuánticas", before: "Las redes ", after: "son más seguras.", line: 7, file: null });
	});

	it("finds the line in the part of a paragraph Paged.js moved to the next page", () => {
		document.body.innerHTML =
			'<div class="pagedjs_page"><p data-ref="r1">Una línea partida</p></div>' +
			`<div class="pagedjs_page"><p data-ref="r1" data-split-from="r1">entre páginas.${marker(12)}</p></div>`;
		select(document.querySelector("p")?.firstChild as Node, 4, 9);
		expect(clickedWord(document)?.line).toBe(12);
	});

	it("reads which included note the line comes from", () => {
		document.body.innerHTML = '<p>Un qubit<span data-underrock-line="5" data-underrock-file="Fisica/2. Qubits.md"></span></p>';
		select(document.querySelector("p")?.firstChild as Node, 3, 8);
		expect(clickedWord(document)).toMatchObject({ word: "qubit", line: 5, file: "Fisica/2. Qubits.md" });
	});

	it("has no line in blocks without markers, like headings", () => {
		document.body.innerHTML = `<h2>Título</h2><p>Texto${marker(3)}</p>`;
		select(document.querySelector("h2")?.firstChild as Node, 0, 6);
		expect(clickedWord(document)?.line).toBeNull();
	});

	it("is null without a selection", () => {
		document.getSelection()?.removeAllRanges();
		expect(clickedWord(document)).toBeNull();
	});
});
