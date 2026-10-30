import type { HeaderFooter } from "./HeaderFooter";
import type { MarginSlot } from "./MarginSlot";
import type { RunningValues } from "./RunningValues";

const VARIABLE = /\{(page|pages|title|date|section)\}/g;
const SEPARATOR = '"   ·   "';

/** `@page` margin boxes for page numbers, header and footer, in the form Paged.js renders. */
export function marginBoxesCss(config: HeaderFooter, values: RunningValues): string {
	const slots = new Map<MarginSlot, string[]>();
	const add = (slot: MarginSlot, template: string) => {
		const content = contentValue(template, values);
		if (content !== "") slots.set(slot, [...(slots.get(slot) ?? []), content]);
	};
	add(`top-${config.headerPosition}`, config.header);
	if (config.pageNumbers) add(config.pageNumberPosition, config.pageNumberFormat);
	add(`bottom-${config.footerPosition}`, config.footer);
	if (slots.size === 0) return "";

	const boxes = [...slots].map(([slot, parts]) => `\t@${slot} {\n\t\tcontent: ${parts.join(` ${SEPARATOR} `)};\n\t}`);
	const css = [`@page {\n${boxes.join("\n")}\n}`];
	if (!config.onFirstPage) {
		css.push(`@page :first {\n${[...slots.keys()].map((slot) => `\t@${slot} {\n\t\tcontent: none;\n\t}`).join("\n")}\n}`);
	}
	if ([config.header, config.footer, config.pageNumbers ? config.pageNumberFormat : ""].some((t) => t.includes("{section}"))) {
		css.push("h1, h2 {\n\tstring-set: section content(text);\n}");
	}
	return `${css.join("\n")}\n`;
}

/** A CSS `content` value for a template such as `Page {page} of {pages}`. Empty for an empty template. */
export function contentValue(template: string, values: RunningValues): string {
	const parts: string[] = [];
	let last = 0;
	for (const match of template.matchAll(VARIABLE)) {
		pushText(parts, template.slice(last, match.index));
		const variable = match[1];
		if (variable === "page" || variable === "pages") parts.push(`counter(${variable})`);
		else if (variable === "section") parts.push("string(section)");
		else pushText(parts, variable === "title" ? values.title : values.date);
		last = match.index + match[0].length;
	}
	pushText(parts, template.slice(last));
	return parts.join(" ");
}

function pushText(parts: string[], text: string): void {
	const clean = text.replace(/[\r\n]+/g, " ");
	if (clean !== "") parts.push(`"${clean.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
}
