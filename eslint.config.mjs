import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
	{
		ignores: ["main.js", "node_modules", "esbuild.config.mjs", "eslint.config.mjs", "version-bump.mjs", "vitest.config.ts"],
	},
	...obsidianmd.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
	},
	{
		files: ["src/**/*.ts"],
		rules: {
			"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
		},
	},
	{
		files: ["src/**/*.test.ts", "src/testing/**/*.ts"],
		rules: {
			"obsidianmd/no-nodejs-modules": "off",
			"no-undef": "off",
			"obsidianmd/prefer-create-el": "off",
			"@microsoft/sdl/no-inner-html": "off",
			"no-unsanitized/property": "off",
		},
	},
]);
