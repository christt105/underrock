const WORDS =
	"lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(" ");

/** Deterministic filler text, so layouts are reproducible between runs. */
export function words(count: number, seed: number): string {
	const out: string[] = [];
	for (let i = 0; i < count; i++) out.push(WORDS[(seed * 7 + i * 3) % WORDS.length] ?? "lorem");
	return out.join(" ");
}

/** Many sections of uneven length, shaped like Obsidian's reading-view output after cleanup. */
export function longDocument(sections: number): string {
	const parts: string[] = [];
	for (let s = 0; s < sections; s++) {
		parts.push(`<h${(s % 3) + 1} id="s${s}">Section ${s}</h${(s % 3) + 1}>`);
		const paragraphs = 1 + (s % 3);
		for (let p = 0; p < paragraphs; p++) parts.push(`<p>${words(20 + ((s * 13 + p * 29) % 90), s + p)}</p>`);
	}
	return parts.join("\n");
}
