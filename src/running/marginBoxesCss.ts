import type { HeaderFooter } from "./HeaderFooter";
import type { MarginSlot } from "./MarginSlot";
import type { RunningValues } from "./RunningValues";

const VARIABLE = /\{(page|pages|title|date|section)\}/g;
const SEPARATOR = '"   ·   "';
/** A line break inside a CSS string; the space ends the escape so a following letter isn't read as hex. */
const LINE_BREAK = "\\A ";

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

	const boxes = [...slots].map(([slot, parts]) => {
		const content = parts.join(` ${SEPARATOR} `);
		const lines = content.includes(LINE_BREAK) ? "\n\t\twhite-space: pre-line;" : "";
		return `\t@${slot} {\n\t\tcontent: ${content};${lines}\n\t}`;
	});
	const css = [`@page {\n${boxes.join("\n")}\n}`];
	if (!config.onFirstPage) {
		css.push(`@page :first {\n${[...slots.keys()].map((slot) => `\t@${slot} {\n\t\tcontent: none;\n\t}`).join("\n")}\n}`);
	}
	if (config.headerRule && [...slots.keys()].some((slot) => slot.startsWith("top-"))) css.push(headerRuleCss(config.onFirstPage));
	if ([config.header, config.footer, config.pageNumbers ? config.pageNumberFormat : ""].some((t) => t.includes("{section}"))) {
		css.push("h1, h2 {\n\tstring-set: section content(text);\n}");
	}
	return `${css.join("\n")}\n`;
}

/**
 * A line across the text width under the top margin, on the pages that show something there: not
 * the cover, nor the first page when it is left bare.
 */
function headerRuleCss(onFirstPage: boolean): string {
	const bare = [".pagedjs_cover_page .pagedjs_margin-top", ...(onFirstPage ? [] : [".pagedjs_first_page .pagedjs_margin-top"])];
	return [
		".pagedjs_margin-top:has(.hasContent) {\n\tborder-bottom: 0.5pt solid var(--ur-color-border);\n}",
		`${bare.join(",\n")} {\n\tborder-bottom: none;\n}`,
	].join("\n");
}

/**
 * A CSS `content` value for a template such as `Page {page} of {pages}`. Empty for an empty template.
 * Each line of a template on several lines, like a YAML `|` block, gets a line of its own.
 */
export function contentValue(template: string, values: RunningValues): string {
	template = template.replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, "");
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
	if (text === "") return;
	const escaped = text
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/[ \t]*\r?\n[ \t]*/g, LINE_BREAK);
	parts.push(`"${escaped}"`);
}
