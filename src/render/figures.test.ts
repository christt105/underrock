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
});

function embed(file: string, alt = file): string {
	return `<span class="internal-embed media-embed image-embed is-loaded" src="${file}" alt="${alt}"><img alt="${alt}" src="app://vault/${file}"></span>`;
}

function wrap(html: string): HTMLElement {
	const root = document.createElement("div");
	root.innerHTML = html;
	wrapFigures(root);
	return root;
}

function captions(root: HTMLElement): string[] {
	return Array.from(root.querySelectorAll("figcaption")).map((c) => c.textContent ?? "");
}

describe("wrapFigures", () => {
	it("captions an image with its alt text", () => {
		const root = wrap(`<p>${embed("cat.png", "A sleeping cat")}</p>`);
		expect(root.querySelector("p")).toBeNull();
		expect(root.querySelector("figure.underrock-figure img")).not.toBeNull();
		expect(captions(root)).toEqual(["A sleeping cat"]);
	});

	it("captions Markdown images too", () => {
		expect(captions(wrap('<p><img alt="A running dog" src="dog.jpg"></p>'))).toEqual(["A running dog"]);
	});

	it("puts images on consecutive lines side by side, each with its own caption", () => {
		const root = wrap(`<p>${embed("cat.png", "Cat")}<br>\n${embed("dog.png", "Dog")}<br>\n${embed("fish.png")}</p>`);
		const row = root.querySelector(".underrock-figure-row");
		expect(row?.children).toHaveLength(3);
		expect(Array.from(row?.children ?? []).every((c) => c.tagName === "FIGURE")).toBe(true);
		expect(captions(root)).toEqual(["Cat", "Dog"]);
	});

	it("ignores alt text that is the file name or only a size", () => {
		const root = wrap(`<p>${embed("photos/cat.png", "cat.png")}<br>${embed("dog.png", "300")}<br>${embed("fish.png", "300x200")}</p>`);
		expect(captions(root)).toEqual([]);
	});

	it("leaves a single image without caption alone", () => {
		const root = wrap(`<p>${embed("cat.png")}</p>`);
		expect(root.querySelector("p")).not.toBeNull();
		expect(root.querySelector("figure")).toBeNull();
	});

	it("leaves images within text alone", () => {
		const root = wrap('<p>See <img alt="Cat" src="cat.png"> here.</p>');
		expect(root.querySelector("figure")).toBeNull();
	});

	it("leaves embeds that are not loaded images alone", () => {
		const root = wrap('<p><span class="internal-embed image-embed is-unresolved" src="missing.png" alt="Missing"></span></p>');
		expect(root.querySelector("figure")).toBeNull();
	});
});
