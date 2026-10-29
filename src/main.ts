import { Notice, Plugin } from "obsidian";

export default class UnderrockPlugin extends Plugin {
	override async onload(): Promise<void> {
		this.addCommand({
			id: "show-version",
			name: "Show installed version",
			callback: () => {
				new Notice(`Underrock ${this.manifest.version}`);
			},
		});
	}
}
