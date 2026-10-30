import { DEFAULT_TYPOGRAPHY } from "./Typography";
import type { Typography } from "./Typography";

const HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

/**
 * CSS variables for the typography settings that differ from the defaults, so a template's own values
 * apply until the user changes a setting.
 */
export function typographyCss(typography: Typography): string {
	const vars: string[] = [];
	const font = (name: string, value: string) => {
		const family = fontFamily(value);
		if (family !== "") vars.push(`--ur-font-${name}: ${family};`);
	};
	font("body", typography.bodyFont);
	font("heading", typography.headingFont);
	font("code", typography.codeFont);
	const changed = <K extends keyof Typography>(key: K) => typography[key] !== DEFAULT_TYPOGRAPHY[key];
	if (changed("bodySize")) vars.push(`--ur-size-body: ${typography.bodySize}pt;`);
	for (const level of HEADINGS) {
		if (changed(`${level}Size`)) vars.push(`--ur-size-${level}: ${typography[`${level}Size`]}pt;`);
	}
	if (changed("lineHeight")) vars.push(`--ur-line-height: ${typography.lineHeight};`);
	if (changed("textColor") && isColor(typography.textColor)) vars.push(`--ur-color-text: ${typography.textColor};`);
	if (changed("headingColor") && isColor(typography.headingColor)) vars.push(`--ur-color-heading: ${typography.headingColor};`);
	if (vars.length === 0) return "";
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
