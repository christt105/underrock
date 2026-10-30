import type { App, TFile } from "obsidian";
import type { RenderSource } from "./RenderSource";

export async function sourceFromFile(app: App, file: TFile): Promise<RenderSource> {
	const markdown = await app.vault.cachedRead(file);
	const title: unknown = app.metadataCache.getFileCache(file)?.frontmatter?.title;
	return {
		path: file.path,
		title: typeof title === "string" && title.trim() !== "" ? title : file.basename,
		markdown,
	};
}
