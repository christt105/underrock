import { vi } from "vitest";

/** Stand-ins for the DOM helpers Obsidian adds to the window, for tests that run outside it. */
export function stubObsidianDom(): void {
	const createEl = (tag: string, o: { cls?: string; text?: string } = {}) => {
		const el = document.createElement(tag);
		if (o.cls !== undefined) el.className = o.cls;
		if (o.text !== undefined) el.textContent = o.text;
		return el;
	};
	vi.stubGlobal("createEl", createEl);
	vi.stubGlobal("createDiv", (o?: { cls?: string }) => createEl("div", o));
	vi.stubGlobal("createSpan", (o?: { cls?: string; text?: string }) => createEl("span", o));
}
