import type { Typography } from "./Typography";

const HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

/** CSS variables that apply the typography settings on top of the document stylesheet. */
export function typographyCss(typography: Typography): string {
	const vars: string[] = [];
	const font = (name: string, value: string) => {
		const family = fontFamily(value);
		if (family !== "") vars.push(`--ur-font-${name}: ${family};`);
	};
	font("body", typography.bodyFont);
	font("heading", typography.headingFont);
	font("code", typography.codeFont);
	vars.push(`--ur-size-body: ${typography.bodySize}pt;`);
	for (const level of HEADINGS) vars.push(`--ur-size-${level}: ${typography[`${level}Size`]}pt;`);
	vars.push(`--ur-line-height: ${typography.lineHeight};`);
	if (isColor(typography.textColor)) vars.push(`--ur-color-text: ${typography.textColor};`);
	if (isColor(typography.headingColor)) vars.push(`--ur-color-heading: ${typography.headingColor};`);
	return `:root {\n${vars.map((v) => `\t${v}`).join("\n")}\n}\n`;
}

/** Quotes each family in a comma-separated list and drops characters that could break out of the declaration. */
export function fontFamily(value: string): string {
	return value
		.split(",")
		.map((family) => family.replace(/["';{}<>\\]/g, "").trim())
		.filter((family) => family !== "")
		.map((family) => (/^(serif|sans-serif|monospace|cursive|fantasy|system-ui)$/.test(family) ? family : `"${family}"`))
		.join(", ");
}

function isColor(value: string): boolean {
	return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}
