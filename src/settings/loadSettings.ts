import { applyOverrides } from "./applyOverrides";
import { ALLOWED_VALUES, DEFAULT_SETTINGS } from "./UnderrockSettings";
import type { UnderrockSettings } from "./UnderrockSettings";

/** Stored settings over the defaults, so older or hand-edited data keeps working. */
export function loadSettings(stored: unknown): UnderrockSettings {
	return applyOverrides(DEFAULT_SETTINGS, stored, ALLOWED_VALUES);
}

/** Settings for one note: the plugin settings with the note's `underrock` frontmatter on top. */
export function settingsForNote(settings: UnderrockSettings, frontmatter: unknown): UnderrockSettings {
	return applyOverrides(settings, frontmatter, ALLOWED_VALUES);
}
