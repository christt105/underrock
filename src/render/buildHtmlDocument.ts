import type { HtmlDocumentParts } from "./HtmlDocumentParts";

/** Assembles a standalone HTML document from a rendered note, its styles and scripts. */
export function buildHtmlDocument(parts: HtmlDocumentParts): string {
	const styles = [
		...parts.stylesheets.map((css) => `<style>${escapeRawText(css, "style")}</style>`),
		...parts.screenStylesheets.map((css) => `<style media="screen">${escapeRawText(css, "style")}</style>`),
	].join("\n");
	const scripts = parts.scripts.map((js) => `<script>${escapeRawText(js, "script")}</script>`).join("\n");
	return [
		"<!DOCTYPE html>",
		`<html lang="${escapeAttribute(parts.lang)}">`,
		"<head>",
		'<meta charset="utf-8">',
		`<base href="${escapeAttribute(parts.baseUrl)}">`,
		`<title>${escapeText(parts.title)}</title>`,
		styles,
		scripts,
		"</head>",
		`<body class="underrock-document">${parts.bodyHtml}</body>`,
		"</html>",
	].join("\n");
}

function escapeText(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(text: string): string {
	return escapeText(text).replace(/"/g, "&quot;");
}

function escapeRawText(text: string, tag: "style" | "script"): string {
	return text.replace(new RegExp(`</(${tag})`, "gi"), "<\\/$1");
}
