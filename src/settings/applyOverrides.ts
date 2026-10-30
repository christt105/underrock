/** Allowed values for settings that take one of a fixed set of strings, by dotted key. */
export type AllowedValues = Readonly<Record<string, readonly string[]>>;

/**
 * Layers `override` on top of `base`, keeping only keys that exist in `base` with a value of the
 * same type (non-negative finite numbers, booleans, strings from `allowed` where listed, nested
 * objects merged recursively). Anything else, such as a typo in a note's frontmatter, is ignored.
 */
export function applyOverrides<T extends object>(base: T, override: unknown, allowed: AllowedValues = {}, prefix = ""): T {
	if (!isRecord(override)) return base;
	const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
	for (const [key, current] of Object.entries(base)) {
		if (!(key in override)) continue;
		const value = override[key];
		const path = prefix + key;
		if (isRecord(current)) {
			result[key] = applyOverrides(current, value, allowed, `${path}.`);
		} else if (accepts(current, value, allowed[path])) {
			result[key] = value;
		}
	}
	return result as T;
}

function accepts(current: unknown, value: unknown, allowed: readonly string[] | undefined): boolean {
	if (typeof current !== typeof value) return false;
	if (typeof value === "number") return Number.isFinite(value) && value >= 0;
	if (typeof value === "string" && allowed !== undefined) return allowed.includes(value);
	return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
