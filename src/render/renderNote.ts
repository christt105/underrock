import { Component, MarkdownRenderer, finishRenderMath, loadMathJax } from "obsidian";
import type { App } from "obsidian";
import type { CleanOptions } from "./CleanOptions";
import type { RenderSource } from "./RenderSource";
import type { RenderedNote } from "./RenderedNote";
import { cleanRenderedHtml } from "./cleanRenderedHtml";
import { collectHeadings } from "./collectHeadings";
import { collectMathCss } from "./collectMathCss";
import { includeNotes } from "./includeNotes";
import { waitForSettled } from "./waitForSettled";

/** Renders a note with Obsidian's own Markdown renderer, so math, callouts and plugin output match the app. */
export async function renderNote(app: App, source: RenderSource, options: CleanOptions): Promise<RenderedNote> {
	const component = new Component();
	component.load();
	const host = activeDocument.body.createDiv({ cls: "underrock-render-host" });
	const content = host.createDiv({ cls: "markdown-preview-view markdown-rendered" });
	try {
		const { markdown, included } = await includeNotes({ path: source.path, markdown: source.markdown }, async (link, fromPath) => {
			const file = app.metadataCache.getFirstLinkpathDest(link, fromPath);
			if (!file || file.extension !== "md") return null;
			return { path: file.path, markdown: await app.vault.cachedRead(file) };
		});
		await MarkdownRenderer.render(app, markdown, content, source.path, component);
		if (content.querySelector(".math")) {
			await loadMathJax();
			await finishRenderMath();
		}
		await waitForSettled(content, { quietMs: 250, timeoutMs: 10000 });
		const figures = cleanRenderedHtml(content, { ...options, includedNotes: included });
		return {
			title: source.title,
			html: content.innerHTML,
			mathCss: collectMathCss(activeDocument),
			headings: collectHeadings(content),
			figures,
		};
	} finally {
		component.unload();
		host.remove();
	}
}
