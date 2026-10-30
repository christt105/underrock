import { FileSystemAdapter, Notice } from "obsidian";
import type { App, TFile } from "obsidian";
import type { PdfEngine } from "../engines/PdfEngine";
import { sourceFromFile } from "../render/sourceFromFile";
import { chooseSavePath, writePdf } from "./savePdf";

export async function exportNoteToPdf(app: App, engine: PdfEngine, file: TFile): Promise<void> {
	if (!engine.isAvailable()) {
		new Notice("Exporting to PDF is only available on desktop for now.");
		return;
	}
	const target = await chooseSavePath(defaultPdfPath(app, file));
	if (target === undefined) return;
	const progress = new Notice("Exporting to PDF…", 0);
	try {
		const pdf = await engine.render(await sourceFromFile(app, file));
		await writePdf(target, pdf);
		new Notice(`Exported to ${target}`);
	} catch (error) {
		console.error("Underrock: PDF export failed", error);
		new Notice(`PDF export failed: ${error instanceof Error ? error.message : String(error)}`);
	} finally {
		progress.hide();
	}
}

function defaultPdfPath(app: App, file: TFile): string {
	const name = `${file.basename}.pdf`;
	const adapter = app.vault.adapter;
	if (!(adapter instanceof FileSystemAdapter)) return name;
	const folder = file.parent?.path ?? "";
	return adapter.getFullPath(folder === "" || folder === "/" ? name : `${folder}/${name}`);
}
