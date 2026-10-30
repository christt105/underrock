import { DEFAULT_SETTINGS } from "./UnderrockSettings";
import type { UnderrockSettings } from "./UnderrockSettings";

/** Fills in missing fields of stored settings with defaults, so older data keeps working. */
export function loadSettings(stored: unknown): UnderrockSettings {
	const data = isRecord(stored) ? stored : {};
	const page = isRecord(data.page) ? data.page : {};
	const merged: UnderrockSettings = {
		...DEFAULT_SETTINGS,
		...data,
		page: { ...DEFAULT_SETTINGS.page, ...page },
	};
	return merged;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
