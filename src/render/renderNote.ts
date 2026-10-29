import { Component, MarkdownRenderer, finishRenderMath, getFrontMatterInfo } from "obsidian";
import type { App } from "obsidian";
import type { CleanOptions } from "./CleanOptions";
import type { RenderSource } from "./RenderSource";
import type { RenderedNote } from "./RenderedNote";
import { cleanRenderedHtml } from "./cleanRenderedHtml";
import { collectMathCss } from "./collectMathCss";
import { waitForSettled } from "./waitForSettled";

/** Renders a note with Obsidian's own Markdown renderer, so math, callouts and plugin output match the app. */
export async function renderNote(app: App, source: RenderSource, options: CleanOptions): Promise<RenderedNote> {
	const component = new Component();
	component.load();
	const host = activeDocument.body.createDiv({ cls: "underrock-render-host" });
	const content = host.createDiv({ cls: "markdown-preview-view markdown-rendered" });
	try {
		const { contentStart } = getFrontMatterInfo(source.markdown);
		await MarkdownRenderer.render(app, source.markdown.slice(contentStart), content, source.path, component);
		await finishRenderMath();
		await waitForSettled(content, { quietMs: 250, timeoutMs: 10000 });
		cleanRenderedHtml(content, options);
		return { title: source.title, html: content.innerHTML, mathCss: collectMathCss(activeDocument) };
	} finally {
		component.unload();
		host.remove();
	}
}
