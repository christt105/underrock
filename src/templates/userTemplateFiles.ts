import { TFile } from "obsidian";
import type { App } from "obsidian";

/** CSS files in the templates folder. Each one is a template named after the file. */
export function userTemplateFiles(app: App, folderPath: string): TFile[] {
	const folder = folderPath.trim() === "" ? null : app.vault.getFolderByPath(folderPath.trim());
	if (!folder) return [];
	return folder.children.filter((file): file is TFile => file instanceof TFile && file.extension.toLowerCase() === "css");
}
