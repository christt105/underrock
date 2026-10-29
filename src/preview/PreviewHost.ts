import type { TFile } from "obsidian";
import type { DocumentBuilder } from "../export/DocumentBuilder";

/** What the preview needs from the plugin. */
export interface PreviewHost {
	readonly builder: DocumentBuilder;
	exportFile(file: TFile): Promise<void>;
}
