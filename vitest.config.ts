import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vitest/config";
import type { Plugin } from "vitest/config";

const RAW_CSS_PREFIX = "\0raw-css:";
const RAW_CSS_SUFFIX = ".raw.js";

/** Vitest empties any module whose id ends in `.css`, `?raw` included; load them as text like the esbuild bundle does. */
const rawCss: Plugin = {
	name: "raw-css",
	enforce: "pre",
	resolveId(source, importer) {
		if (!source.endsWith(".css?raw") || importer === undefined) return null;
		return RAW_CSS_PREFIX + resolve(dirname(importer), source.slice(0, -"?raw".length)) + RAW_CSS_SUFFIX;
	},
	load(id) {
		if (!id.startsWith(RAW_CSS_PREFIX)) return null;
		const css = readFileSync(id.slice(RAW_CSS_PREFIX.length, -RAW_CSS_SUFFIX.length), "utf8");
		return `export default ${JSON.stringify(css)};`;
	},
};

export default defineConfig({
	plugins: [rawCss],
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: "unit",
					include: ["src/**/*.test.ts"],
					exclude: ["src/**/*.layout.test.ts"],
				},
			},
			{
				extends: true,
				test: {
					name: "layout",
					include: ["src/**/*.layout.test.ts"],
					testTimeout: 60000,
					hookTimeout: 60000,
				},
			},
		],
	},
});
