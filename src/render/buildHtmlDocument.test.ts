import { describe, expect, it } from "vitest";
import { buildHtmlDocument } from "./buildHtmlDocument";

const PARTS = {
	title: "Notes & <stuff>",
	lang: "en",
	baseUrl: "app://obsidian.md/",
	bodyHtml: "<p>Hi</p>",
	stylesheets: ["p { color: red }"],
	screenStylesheets: ["html { background: grey }"],
	scripts: ['window.x = "</script>";'],
};

describe("buildHtmlDocument", () => {
	it("places styles, scripts and body in a standalone document", () => {
		const html = buildHtmlDocument(PARTS);
		expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
		expect(html).toContain('<base href="app://obsidian.md/">');
		expect(html).toContain("<style>p { color: red }</style>");
		expect(html).toContain('<style media="screen">html { background: grey }</style>');
		expect(html).toContain('<body class="underrock-document"><p>Hi</p></body>');
	});

	it("escapes the title", () => {
		expect(buildHtmlDocument(PARTS)).toContain("<title>Notes &amp; &lt;stuff&gt;</title>");
	});

	it("keeps a closing tag inside a script from ending it early", () => {
		const html = buildHtmlDocument(PARTS);
		expect(html).toContain('window.x = "<\\/script>";');
		expect(html.match(/<\/script>/g)).toHaveLength(1);
	});
});
