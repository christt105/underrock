import { Platform } from "obsidian";

/** Asks where to save the PDF with the system dialog. Returns `undefined` if the user cancels. Desktop only. */
export async function chooseSavePath(defaultPath: string): Promise<string | undefined> {
	const { remote } = await import("electron");
	const result = await remote.dialog.showSaveDialog({
		title: "Export to PDF",
		defaultPath,
		filters: [{ name: "PDF", extensions: ["pdf"] }],
	});
	return result.canceled ? undefined : result.filePath;
}

/** Writes the PDF to an absolute path outside the vault. Desktop only. */
export async function writePdf(path: string, pdf: Uint8Array): Promise<void> {
	if (Platform.isDesktop) {
		const { writeFile } = await import("fs/promises");
		await writeFile(path, pdf);
		return;
	}
	throw new Error("Saving outside the vault needs the desktop app");
}
