import { describe, expect, it } from "vitest";
import { DOCUMENT_CSS } from "./documentCss";

describe("DOCUMENT_CSS", () => {
	it("is bundled as text", () => {
		expect(DOCUMENT_CSS).toContain("--ur-font-body");
	});
});
