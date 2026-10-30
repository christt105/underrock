import minimal from "./minimal.css?raw";
import report from "./report.css?raw";

export const DEFAULT_TEMPLATE = "article";

/** Templates that ship with the plugin, by name. `article` is the base document style with nothing on top. */
export const BUILT_IN_TEMPLATES: ReadonlyMap<string, string> = new Map([
	["article", ""],
	["report", report],
	["minimal", minimal],
]);
