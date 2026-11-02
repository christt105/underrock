// @vitest-environment happy-dom
import { beforeAll, describe, expect, it, vi } from "vitest";
import { wrapFigures } from "./figures";

/** Stand-ins for the DOM helpers Obsidian adds to the window. */
beforeAll(() => {
	const createEl = (tag: string, o: { cls?: string; text?: string } = {}) => {
		const el = document.createElement(tag);
		if (o.cls !== undefined) el.className = o.cls;
		if (o.text !== undefined) el.textContent = o.text;
		return el;
	};
	vi.stubGlobal("createEl", createEl);
	vi.stubGlobal("createDiv", (o?: { cls?: string }) => createEl("div", o));
	vi.stubGlobal("createSpan", (o?: { cls?: string; text?: string }) => createEl("span", o));
});

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

	it("puts images on consecutive lines side by side, labelled (a), (b)… with their alt text", () => {
		const root = wrap(`<p>${embed("tx.png", "Tx Schematic")}<br>\n${embed("rx.png")}</p>`);
		const row = root.querySelector(".underrock-figure > .underrock-figure-row");
		expect(Array.from(row?.children ?? []).map((c) => c.className)).toEqual(["underrock-subfigure", "underrock-subfigure"]);
		expect(captions(root, ".underrock-subfigure > figcaption")).toEqual(["(a) Tx Schematic", "(b)"]);
		expect(captions(root)).toEqual([]);
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

	it("numbers captioned figures in order and names them in the document language", () => {
		const root = wrap(`<p>${embed("a.png", "One")}</p><p>${embed("b.png")}<br>${embed("c.png")}</p><p>${embed("d.png", "Two")}</p>`, "es-ES");
		expect(captions(root)).toEqual(["Figura 1: One", "Figura 2: Two"]);
	});

	it("ignores alt text that is the file name or only a size", () => {
		const root = wrap(`<p>${embed("photos/cat.png", "cat.png")}<br>${embed("dog.png", "300")}<br>${embed("fish.png", "300x200")}</p>`);
		expect(captions(root, ".underrock-subfigure > figcaption")).toEqual(["(a)", "(b)", "(c)"]);
	});

	it("leaves a single image without caption alone", () => {
		const root = wrap(`<p>Some text<br>${embed("cat.png")}</p>`);
		expect(root.querySelector("figure")).toBeNull();
		expect(root.querySelector("p .image-embed")).not.toBeNull();
	});

	it("leaves images within text, or with text between them, alone", () => {
		expect(wrap('<p>See <img alt="Cat" src="cat.png"> here.</p>').querySelector("figure")).toBeNull();
		expect(wrap(`<p>${embed("a.png", "A")}<br>Between<br>${embed("b.png", "B")}</p>`).querySelector("figure")).toBeNull();
	});

	it("leaves embeds that are not loaded images alone", () => {
		const root = wrap('<p><span class="internal-embed image-embed is-unresolved" src="missing.png" alt="Missing"></span></p>');
		expect(root.querySelector("figure")).toBeNull();
	});
});
