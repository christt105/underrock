import { MarkdownView, Notice, Plugin } from "obsidian";
import { HtmlPdfEngine } from "./engines/html/HtmlPdfEngine";
import type { PdfEngine } from "./engines/PdfEngine";
import { DocumentBuilder } from "./export/DocumentBuilder";
import { exportNoteToPdf } from "./export/exportNoteToPdf";
import { loadSettings } from "./settings/loadSettings";
import { DEFAULT_SETTINGS } from "./settings/UnderrockSettings";
import type { UnderrockSettings } from "./settings/UnderrockSettings";
import { UnderrockSettingTab } from "./settings/UnderrockSettingTab";

export default class UnderrockPlugin extends Plugin {
	override settings: UnderrockSettings = DEFAULT_SETTINGS;
	private engine!: PdfEngine;

	override async onload(): Promise<void> {
		this.settings = loadSettings(await this.loadData());
		const builder = new DocumentBuilder(this.app, () => this.settings);
		this.engine = new HtmlPdfEngine(this.app, builder, this.scratchDir(), () => this.settings.language);
		this.addSettingTab(new UnderrockSettingTab(this.app, this));

		this.addCommand({
			id: "export-pdf",
			name: "Export current note to PDF",
			checkCallback: (checking) => {
				const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
				if (!file) return false;
				if (!checking) void exportNoteToPdf(this.app, this.engine, file);
				return true;
			},
		});

		this.addCommand({
			id: "show-version",
			name: "Show installed version",
			callback: () => {
				new Notice(`Underrock ${this.manifest.version}`);
			},
		});
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	private scratchDir(): string {
		return this.manifest.dir ?? `${this.app.vault.configDir}/plugins/${this.manifest.id}`;
	}
}
