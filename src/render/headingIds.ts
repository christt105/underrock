/** Turns heading text into an id usable as a URL fragment. */
export function slugify(text: string): string {
	const slug = text
		.trim()
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^\p{L}\p{N}\s-]/gu, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
	return slug === "" ? "section" : slug;
}

/**
 * Gives every heading under `root` a unique id and returns a map from the
 * heading text, as Obsidian writes it in `[[#Heading]]` links, to that id.
 */
export function assignHeadingIds(root: HTMLElement): Map<string, string> {
	const byText = new Map<string, string>();
	const used = new Set<string>();
	for (const heading of Array.from(root.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6"))) {
		const text = heading.dataset.heading ?? heading.textContent ?? "";
		const base = slugify(text);
		let id = base;
		for (let n = 1; used.has(id); n++) id = `${base}-${n}`;
		used.add(id);
		heading.id = id;
		if (!byText.has(text)) byText.set(text, id);
	}
	return byText;
}
