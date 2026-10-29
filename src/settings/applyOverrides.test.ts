import { describe, expect, it } from "vitest";
import { applyOverrides } from "./applyOverrides";

const BASE = { size: "A4", landscape: false, margin: 20, font: { family: "", size: 11 } };

describe("applyOverrides", () => {
	it("replaces matching keys and merges nested objects", () => {
		const result = applyOverrides(BASE, { landscape: true, font: { size: 12 } });
		expect(result).toEqual({ size: "A4", landscape: true, margin: 20, font: { family: "", size: 12 } });
	});

	it("ignores unknown keys, wrong types and negative or non-finite numbers", () => {
		const result = applyOverrides(BASE, { colour: "red", landscape: "yes", margin: -5, font: { size: Infinity } });
		expect(result).toEqual(BASE);
	});

	it("only accepts listed values where a key has a fixed set", () => {
		const allowed = { size: ["A4", "Letter"] };
		expect(applyOverrides(BASE, { size: "Letter" }, allowed).size).toBe("Letter");
		expect(applyOverrides(BASE, { size: "A3" }, allowed).size).toBe("A4");
	});

	it("leaves the base untouched for anything that isn't an object", () => {
		expect(applyOverrides(BASE, null)).toBe(BASE);
		expect(applyOverrides(BASE, ["x"])).toBe(BASE);
		expect(applyOverrides(BASE, { font: "big" }).font).toEqual(BASE.font);
	});
});
