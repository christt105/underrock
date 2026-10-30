import type { App, TFile } from "obsidian";
import type { RenderSource } from "./RenderSource";

export async function sourceFromFile(app: App, file: TFile, markdown?: string): Promise<RenderSource> {
	const frontmatter: Record<string, unknown> = app.metadataCache.getFileCache(file)?.frontmatter ?? {};
	return {
		path: file.path,
		title: nonEmptyString(frontmatter.title) ?? file.basename,
		author: nonEmptyString(frontmatter.author),
		date: nonEmptyString(frontmatter.date),
		lang: nonEmptyString(frontmatter.lang),
		markdown: markdown ?? (await app.vault.cachedRead(file)),
		overrides: frontmatter.underrock,
	};
}

function nonEmptyString(value: unknown): string | undefined {
	return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}
