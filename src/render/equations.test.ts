// @vitest-environment happy-dom
import { beforeAll, describe, expect, it } from "vitest";
import { stubObsidianDom } from "../testing/obsidianDom";
import { numberEquations } from "./equations";

beforeAll(stubObsidianDom);

const id = (name: string) => `<span data-underrock-block-id="${name}"></span>`;
const line = (n: number) => `<span data-underrock-line="${n}"></span>`;
const blockMath = (tex: string) => `<div class="math math-block is-loaded"><mjx-container display="true">${tex}</mjx-container></div>`;
const lineMath = (tex: string) => `<span class="math math-block is-loaded"><mjx-container display="true">${tex}</mjx-container></span>`;

function number(html: string, lang = "es"): HTMLElement {
	const root = document.createElement("div");
	root.innerHTML = html;
	numberEquations(root, lang);
	return root;
}

function numbers(root: HTMLElement): string[] {
	return Array.from(root.querySelectorAll(".underrock-equation-number")).map((n) => n.textContent ?? "");
}

describe("numberEquations", () => {
	it("numbers math on lines of its own whose block id follows it, taking the id's paragraph", () => {
		const root = number(`${blockMath("dS > 0")}<p>${id("entropia")}${line(9)}</p>`);
		const equation = root.querySelector("#equation-entropia");
		expect(equation?.classList.contains("underrock-equation")).toBe(true);
		expect(numbers(root)).toEqual(["(1)"]);
		expect(root.querySelector("p")).toBeNull();
		expect(equation?.querySelector('[data-underrock-line="9"]')).not.toBeNull();
	});

	it("numbers math on one line with its block id after it", () => {
		const root = number(`<p>${lineMath("dS \\ge 0")} ${id("segunda")}${line(4)}</p>`);
		expect(root.querySelector("span#equation-segunda")).not.toBeNull();
		expect(numbers(root)).toEqual(["(1)"]);
	});

	it("numbers only math with a block id, in order, and returns how links show them", () => {
		const root = document.createElement("div");
		root.innerHTML =
			`${blockMath("a")}<p>Texto${line(3)}</p>` +
			`${blockMath("b")}<p>${id("b")}</p>` +
			`<p>${lineMath("c")}${id("c")}</p>` +
			`<p>Una frase ${id("frase")}</p>`;
		expect(numberEquations(root, "es-ES")).toEqual([
			{ id: "equation-b", label: "Ecuación (1)", blockId: "b" },
			{ id: "equation-c", label: "Ecuación (2)", blockId: "c" },
		]);
		expect(numbers(root)).toEqual(["(1)", "(2)"]);
	});

	it("leaves math alone when text follows it or the id is not right after it", () => {
		expect(numbers(number(`<p>${lineMath("x")} y más texto ${id("x")}</p>`))).toEqual([]);
		expect(numbers(number(`${blockMath("x")}<p>Texto ${id("x")}</p>`))).toEqual([]);
	});

	it("names equations in the document language, defaulting to English", () => {
		const root = document.createElement("div");
		root.innerHTML = `${blockMath("x")}<p>${id("x")}</p>`;
		expect(numberEquations(root, "fr")[0].label).toBe("Équation (1)");
		const other = document.createElement("div");
		other.innerHTML = `${blockMath("x")}<p>${id("x")}</p>`;
		expect(numberEquations(other, "ja")[0].label).toBe("Equation (1)");
	});
});
