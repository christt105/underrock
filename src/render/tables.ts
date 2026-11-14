import { BLOCK_ID_ATTRIBUTE } from "./blockIds";

/** The word before a table number, by primary language subtag. */
const TABLE_WORDS: Record<string, string> = {
	ca: "Taula",
	de: "Tabelle",
	es: "Tabla",
	fr: "Tableau",
	gl: "Táboa",
	it: "Tabella",
	nl: "Tabel",
	pt: "Tabela",
};

/** A numbered table, for links to its block id. */
export interface TableEntry {
	/** Id of the table element. */
	readonly id: string;
	/** Its number with the word before it, like "Table 3". */
	readonly label: string;
	/** Its block id, like `results` for `^results`, empty if it has none. */
	readonly blockId: string;
}

/**
 * Turns a paragraph starting with "Table:", or the word in the document language like "Tabla:", right
 * above a table into its numbered caption, shown above it: "Table 1: …". Tables without one are left
 * alone. The table gets an id from the caption's block id, like `^results`, when it has one.
 */
export function captionTables(root: HTMLElement, lang: string): TableEntry[] {
	const word = TABLE_WORDS[lang.toLowerCase().split("-")[0]] ?? "Table";
	const prefix = new RegExp(`^\\s*(?:Table|${word})\\s*:\\s*`, "i");
	const entries: TableEntry[] = [];
	const blockIds = new Set<string>();
	for (const table of Array.from(root.querySelectorAll("table"))) {
		const paragraph = outermostHolder(table, root).previousElementSibling;
		if (paragraph === null || paragraph.tagName !== "P") continue;
		const match = prefix.exec(paragraph.textContent ?? "");
		if (match === null) continue;
		removeLeadingText(paragraph, match[0].length);
		const number = entries.length + 1;
		const label = `${word} ${number}`;
		const caption = createEl("caption");
		caption.append(createSpan({ cls: "underrock-table-label", text: `${label}:` }), " ", ...Array.from(paragraph.childNodes));
		table.prepend(caption);
		paragraph.remove();
		const blockId = caption.querySelector(`[${BLOCK_ID_ATTRIBUTE}]`)?.getAttribute(BLOCK_ID_ATTRIBUTE) ?? "";
		const named = blockId !== "" && !blockIds.has(blockId);
		if (named) blockIds.add(blockId);
		table.id = named ? `table-${blockId}` : `underrock-table-${number}`;
		entries.push({ id: table.id, label, blockId: named ? blockId : "" });
	}
	return entries;
}

/** The table, or the outermost element that holds only it, like a plugin's scrolling wrapper. */
function outermostHolder(table: Element, root: Element): Element {
	let holder = table;
	while (holder.parentElement !== null && holder.parentElement !== root && holder.parentElement.children.length === 1) {
		holder = holder.parentElement;
	}
	return holder;
}

/** Removes the first `length` characters of an element's text, across its text nodes. */
function removeLeadingText(el: Element, length: number): void {
	const walker = el.ownerDocument.createTreeWalker(el, 4 /* NodeFilter.SHOW_TEXT */);
	let left = length;
	for (let node = walker.nextNode(); node !== null && left > 0; node = walker.nextNode()) {
		const text = node.textContent ?? "";
		node.textContent = text.slice(Math.min(left, text.length));
		left -= Math.min(left, text.length);
	}
}
