// @vitest-environment happy-dom
import { beforeAll, describe, expect, it } from "vitest";
import { stubObsidianDom } from "../testing/obsidianDom";
import { BLOCK_ID_ATTRIBUTE } from "./blockIds";
import { wrapFigures } from "./figures";

beforeAll(stubObsidianDom);

const marker = (id: string) => `<span ${BLOCK_ID_ATTRIBUTE}="${id}"></span>`;

function embed(file: string, alt = file): string {
	return `<span class="internal-embed media-embed image-embed is-loaded" src="${file}" alt="${alt}"><img alt="${alt}" src="app://vault/${file}"></span>`;
}

function wrap(html: string, lang = "en"): HTMLElement {
	const root = document.createElement("div");
	root.innerHTML = html;
	wrapFigures(root, lang);
	return root;
}

function captions(root: HTMLElement, selector = ".underrock-figure > figcaption"): string[] {
	return Array.from(root.querySelectorAll(selector)).map((c) => c.textContent ?? "");
}

describe("wrapFigures", () => {
	it("captions a single image with its alt text and numbers it", () => {
		const root = wrap(`<p>${embed("cat.png", "A sleeping cat")}</p>`);
		expect(root.querySelector("p")).toBeNull();
		expect(root.querySelector("figure.underrock-figure > .image-embed img")).not.toBeNull();
		expect(captions(root)).toEqual(["Figure 1: A sleeping cat"]);
	});

	it("captions Markdown images too", () => {
		expect(captions(wrap('<p><img alt="A running dog" src="dog.jpg"></p>'))).toEqual(["Figure 1: A running dog"]);
	});

	it("puts images on consecutive lines side by side, labelled (a), (b)…", () => {
		const root = wrap(`<p>${embed("tx.png")}<br>\n${embed("rx.png")}</p>`);
		const row = root.querySelector(".underrock-figure > .underrock-figure-row");
		expect(Array.from(row?.children ?? []).map((c) => c.className)).toEqual(["underrock-subfigure", "underrock-subfigure"]);
		expect(captions(root, ".underrock-subfigure > figcaption")).toEqual(["(a)", "(b)"]);
		expect(captions(root)).toEqual(["Figure 1"]);
	});

	it("follows the line below with each image's alt text after its letter", () => {
		const root = wrap(
			`<p>${embed("tx.png", "Tx Schematic: Comparator")}<br>\n${embed("rx.png", "Rx Schematic: Totem pole.")}<br>\nElectronic adapter circuit</p>`,
		);
		expect(captions(root, ".underrock-subfigure > figcaption")).toEqual(["(a)", "(b)"]);
		expect(captions(root)).toEqual(["Figure 1: Electronic adapter circuit (a) Tx Schematic: Comparator (b) Rx Schematic: Totem pole."]);
		expect(root.querySelector(".underrock-figure > figcaption .underrock-figure-label")?.textContent).toBe("Figure 1:");
	});

	it("leaves out the letters of images without alt text, and works without the line below", () => {
		const root = wrap(`<p>${embed("a.png")}<br>${embed("b.png", "Second")}</p>`);
		expect(captions(root)).toEqual(["Figure 1: (b) Second"]);
	});

	it("uses the line right below the images as the numbered caption, keeping its formatting", () => {
		const root = wrap(`<p>${embed("tx.png")}<br>\n${embed("rx.png")}<br>\nElectronic adapter <em>circuit</em></p>`);
		expect(captions(root)).toEqual(["Figure 1: Electronic adapter circuit"]);
		expect(root.querySelector(".underrock-figure > figcaption em")?.textContent).toBe("circuit");
	});

	it("prefers the line below over the alt text for a single image", () => {
		const root = wrap(`<p>${embed("cat.png", "Cat")}<br>\nA sleeping cat</p>`);
		expect(captions(root)).toEqual(["Figure 1: A sleeping cat"]);
	});

	it("keeps text right above the images as its own paragraph", () => {
		const root = wrap(`<p>The Bloch sphere.<br>\n${embed("bloch.png", "Bloch sphere")}</p>`);
		expect(Array.from(root.children).map((c) => c.tagName)).toEqual(["P", "FIGURE"]);
		expect(root.querySelector("p")?.textContent).toBe("The Bloch sphere.");
		expect(captions(root)).toEqual(["Figure 1: Bloch sphere"]);
	});

	it("splits lines kept as newlines, without <br>", () => {
		const root = wrap(`<p>Above\n${embed("a.png")}\n${embed("b.png")}\nBelow</p>`);
		expect(root.querySelector("p")?.textContent).toBe("Above");
		expect(root.querySelectorAll(".underrock-subfigure")).toHaveLength(2);
		expect(captions(root)).toEqual(["Figure 1: Below"]);
	});

	it("numbers every figure in order, a row counting as one, in the document language", () => {
		const root = wrap(
			`<p>${embed("a.png", "One")}</p><p>${embed("b.png", " Bloch sphere")}<br>\n${embed("c.png", "234")}</p><p>${embed("d.png")}</p>`,
			"es-ES",
		);
		expect(captions(root)).toEqual(["Figura 1: One", "Figura 2: (a) Bloch sphere", "Figura 3"]);
	});

	it("ignores alt text that is the file name or only a size", () => {
		const root = wrap(`<p>${embed("photos/cat.png", "cat.png")}<br>${embed("dog.png", "300")}<br>${embed("fish.png", "300x200")}</p>`);
		expect(captions(root)).toEqual(["Figure 1"]);
	});

	it("numbers a single image without caption too", () => {
		const root = wrap(`<p>Some text<br>${embed("cat.png")}</p>`);
		expect(root.querySelector("p")?.textContent).toBe("Some text");
		expect(captions(root)).toEqual(["Figure 1"]);
	});

	it("leaves images within text, or with text between them, alone", () => {
		expect(wrap('<p>See <img alt="Cat" src="cat.png"> here.</p>').querySelector("figure")).toBeNull();
		expect(wrap(`<p>${embed("a.png", "A")}<br>Between<br>${embed("b.png", "B")}</p>`).querySelector("figure")).toBeNull();
	});

	it("leaves embeds that are not loaded images alone", () => {
		const root = wrap('<p><span class="internal-embed image-embed is-unresolved" src="missing.png" alt="Missing"></span></p>');
		expect(root.querySelector("figure")).toBeNull();
	});

	it("gives every figure an id, from its block id if it has one, and returns them in order", () => {
		const root = document.createElement("div");
		root.innerHTML =
			`<p>${embed("a.png", "First")}</p>` +
			`<p>${embed("b.png", "Tx")}<br>${embed("c.png")}<br>Electronic adapter <em>circuit</em> ${marker("circuit")}</p>` +
			`<p>${embed("d.png")}<br>${marker("lone")}</p>` +
			`<p>${embed("e.png")}<br>${marker("lone")}</p>`;
		expect(wrapFigures(root, "es")).toEqual([
			{ id: "underrock-figure-1", label: "Figura 1", description: "First", blockId: "" },
			{ id: "figure-circuit", label: "Figura 2", description: "Electronic adapter circuit", blockId: "circuit" },
			{ id: "figure-lone", label: "Figura 3", description: "", blockId: "lone" },
			{ id: "underrock-figure-4", label: "Figura 4", description: "", blockId: "" },
		]);
		expect(root.querySelector("#figure-circuit > figcaption")?.textContent?.replace(/\s+/g, " ").trim()).toBe(
			"Figura 2: Electronic adapter circuit (a) Tx",
		);
		expect(root.querySelector("#figure-lone > figcaption")?.textContent).toBe("Figura 3");
	});
});
