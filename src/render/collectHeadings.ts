import type { HeadingEntry } from "./HeadingEntry";

/** The headings under `root` that have an id, in document order. */
export function collectHeadings(root: HTMLElement): HeadingEntry[] {
	return Array.from(root.querySelectorAll<HTMLElement>("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]")).map((heading) => ({
		level: Number(heading.tagName.slice(1)),
		text: (heading.textContent ?? "").trim(),
		id: heading.id,
	}));
}
