/** Reads a dotted key such as `page.size` from a settings object. */
export function getSettingPath(settings: object, key: string): unknown {
	let current: unknown = settings;
	for (const part of key.split(".")) {
		if (typeof current !== "object" || current === null) return undefined;
		current = (current as Record<string, unknown>)[part];
	}
	return current;
}

/** Writes a dotted key, copying the objects along the path instead of mutating them. Unknown keys are ignored. */
export function setSettingPath<T extends object>(settings: T, key: string, value: unknown): T {
	const [head, ...rest] = key.split(".");
	if (head === undefined || !(head in settings)) return settings;
	const record = settings as Record<string, unknown>;
	const next = rest.length === 0 ? value : setSettingPath(record[head] as object, rest.join("."), value);
	return { ...settings, [head]: next };
}
