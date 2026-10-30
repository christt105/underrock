import type { Plugin } from "obsidian";
import type { UnderrockSettings } from "./UnderrockSettings";

/** What the settings tab needs from the plugin. */
export interface SettingsHost extends Plugin {
	settings: UnderrockSettings;
	saveSettings(): Promise<void>;
}
