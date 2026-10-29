import esbuild from "esbuild";
import process from "process";
import { readFile } from "node:fs/promises";
import { builtinModules } from "node:module";

const prod = process.argv[2] === "production";

const rawImports = {
	name: "raw-imports",
	setup(build) {
		build.onResolve({ filter: /\?raw$/ }, async (args) => {
			const result = await build.resolve(args.path.slice(0, -"?raw".length), {
				kind: args.kind,
				resolveDir: args.resolveDir,
			});
			if (result.errors.length > 0) return { errors: result.errors };
			return { path: result.path, namespace: "raw" };
		});
		build.onLoad({ filter: /.*/, namespace: "raw" }, async (args) => ({
			contents: await readFile(args.path, "utf8"),
			loader: "text",
		}));
	},
};

const context = await esbuild.context({
	entryPoints: ["src/main.ts"],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
		...builtinModules,
	],
	plugins: [rawImports],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outfile: "main.js",
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
