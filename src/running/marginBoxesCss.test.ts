import { describe, expect, it } from "vitest";
import { DEFAULT_HEADER_FOOTER } from "./HeaderFooter";
import { contentValue, marginBoxesCss } from "./marginBoxesCss";

const VALUES = { title: 'My "notes"', date: "29 October 2026" };

describe("contentValue", () => {
	it("turns variables into counters, strings and literals", () => {
		expect(contentValue("Page {page} of {pages}", VALUES)).toBe('"Page " counter(page) " of " counter(pages)');
		expect(contentValue("{title} · {date}", VALUES)).toBe('"My \\"notes\\"" " · " "29 October 2026"');
		expect(contentValue("{section}", VALUES)).toBe("string(section)");
		expect(contentValue("", VALUES)).toBe("");
	});

	it("escapes backslashes", () => {
		expect(contentValue("a\\b", VALUES)).toBe('"a\\\\b"');
	});

	it("breaks the line where the template does, ignoring the newline a YAML block ends with", () => {
		expect(contentValue("Transport Networks\nSara\r\n{page}\n", VALUES)).toBe('"Transport Networks\\A Sara\\A " counter(page)');
	});
});

describe("marginBoxesCss", () => {
	it("puts the page number in its margin box by default", () => {
		expect(marginBoxesCss(DEFAULT_HEADER_FOOTER, VALUES)).toBe("@page {\n\t@bottom-center {\n\t\tcontent: counter(page);\n\t}\n}\n");
	});

	it("shares a margin box between items that land in the same place", () => {
		const css = marginBoxesCss({ ...DEFAULT_HEADER_FOOTER, footer: "{title}", footerPosition: "center" }, VALUES);
		expect(css).toContain('content: counter(page) "   ·   " "My \\"notes\\"";');
	});

	it("can leave the first page bare and tracks sections only when used", () => {
		const css = marginBoxesCss({ ...DEFAULT_HEADER_FOOTER, header: "{section}", onFirstPage: false }, VALUES);
		expect(css).toContain("@top-right {\n\t\tcontent: string(section);");
		expect(css).toContain("@page :first {\n\t@top-right {\n\t\tcontent: none;\n\t}\n\t@bottom-center {\n\t\tcontent: none;\n\t}\n}");
		expect(css).toContain("string-set: section content(text);");
		expect(marginBoxesCss(DEFAULT_HEADER_FOOTER, VALUES)).not.toContain("string-set");
	});

	it("keeps the line breaks of a header on several lines", () => {
		const css = marginBoxesCss({ ...DEFAULT_HEADER_FOOTER, header: "A\nB" }, VALUES);
		expect(css).toContain('@top-right {\n\t\tcontent: "A\\A B";\n\t\twhite-space: pre-line;\n\t}');
		expect(marginBoxesCss(DEFAULT_HEADER_FOOTER, VALUES)).not.toContain("white-space");
	});

	it("is empty with nothing to show", () => {
		expect(marginBoxesCss({ ...DEFAULT_HEADER_FOOTER, pageNumbers: false }, VALUES)).toBe("");
	});
});
