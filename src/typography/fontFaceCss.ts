import type { FontFile } from "./FontFile";

export const FONT_EXTENSIONS = ["ttf", "otf", "woff", "woff2"];

const WEIGHTS: Record<string, number> = {
	thin: 100,
	extralight: 200,
	ultralight: 200,
	light: 300,
	regular: 400,
	normal: 400,
	book: 400,
	medium: 500,
	semibold: 600,
	demibold: 600,
	bold: 700,
	extrabold: 800,
	ultrabold: 800,
	black: 900,
	heavy: 900,
};

const FORMATS: Record<string, string> = { ttf: "truetype", otf: "opentype", woff: "woff", woff2: "woff2" };

/**
 * `@font-face` rules for font files named like `Family-Style.ext` (`Inter-BoldItalic.ttf`),
 * so a font folder can be used by family name.
 */
export function fontFaceCss(fonts: readonly FontFile[]): string {
	return fonts.map(fontFace).join("\n");
}

function fontFace(font: FontFile): string {
	const file = font.path.split("/").pop() ?? font.path;
	const dot = file.lastIndexOf(".");
	const extension = file.slice(dot + 1).toLowerCase();
	const [family, style = ""] = file.slice(0, dot).split(/-(?=[^-]*$)/);
	const styleKey = style.toLowerCase();
	const italic = /italic|oblique/.test(styleKey);
	const weight = WEIGHTS[styleKey.replace(/italic|oblique/, "")] ?? (styleKey === "" || italic ? 400 : undefined);
	const name = (weight === undefined && !italic ? file.slice(0, dot) : family ?? file).replace(/["\\]/g, "");
	return [
		"@font-face {",
		`\tfont-family: "${name}";`,
		`\tsrc: url("${font.url.replace(/["\\]/g, encodeURIComponent)}") format("${FORMATS[extension] ?? extension}");`,
		`\tfont-weight: ${weight ?? 400};`,
		`\tfont-style: ${italic ? "italic" : "normal"};`,
		"}",
	].join("\n");
}
