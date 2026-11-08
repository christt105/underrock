import { describe, expect, it } from "vitest";
import { includeNotes, noteAnchorId } from "./includeNotes";
import type { NoteText } from "./includeNotes";

const VAULT: Record<string, string> = {
	"Fisica/1. Introducción.md": "---\ntags: [quantum]\n---\n# 1. Introducción\nEl calor fluye[^1].\n\n[^1]: Nunca al revés.",
	"Fisica/2. Qubits.md": "# 2. Qubits\nUn qubit ^qubit\n\n## Bloch\nLa esfera.\n\n## Medida\nColapsa.",
	"Fisica/Libro.md": "",
	"Bucle.md": "Antes\n![[Bucle]]\nDespués",
	"Padre.md": "![[Hija]]",
	"Hija.md": "Texto de la hija.",
};

async function load(link: string): Promise<NoteText | null> {
	const path = Object.keys(VAULT).find((p) => p.replace(/\.md$/, "").split("/").pop() === link);
	return path === undefined ? null : { path, markdown: VAULT[path] };
}

const book = (markdown: string) => includeNotes({ path: "Fisica/Libro.md", markdown }, load);
const lineMarker = (n: number, file?: string) =>
	`<span data-underrock-line="${n}"${file === undefined ? "" : ` data-underrock-file="${file}"`}></span>`;

describe("includeNotes", () => {
	it("puts each embedded note in place, marking its lines with its own line numbers and path", async () => {
		const { markdown, included } = await book("---\ntitle: Libro\n---\n![[1. Introducción]]");
		expect(included).toEqual(["Fisica/1. Introducción.md"]);
		expect(markdown).toContain(`El calor fluye[^n1-1].${lineMarker(4, "Fisica/1. Introducción.md")}`);
		expect(markdown).toContain(`<div id="${noteAnchorId("Fisica/1. Introducción.md")}" class="underrock-note-start"></div>`);
		expect(markdown).not.toContain("tags:");
		expect(markdown).not.toContain("![[1. Introducción]]");
	});

	it("starts each included note on a new page, except the first one with nothing before it", async () => {
		const { markdown } = await book("![[1. Introducción]]\n![[2. Qubits]]\n\n# Bibliografía");
		expect(markdown.match(/<div class="page-break"><\/div>/g)).toHaveLength(1);
		expect(markdown.indexOf("page-break")).toBeGreaterThan(markdown.indexOf("1. Introducción"));
		expect(markdown.indexOf("page-break")).toBeLessThan(markdown.indexOf("# 2. Qubits"));
		const withIntro = await book("# Prólogo\n\n![[1. Introducción]]");
		expect(withIntro.markdown).toContain('<div class="page-break"></div>');
	});

	it("keeps block ids and footnotes of each note apart", async () => {
		const { markdown } = await book("![[1. Introducción]]\n![[1. Introducción]]\n![[2. Qubits]]");
		expect(markdown).toContain("[^n1-1]");
		expect(markdown).toContain("[^n2-1]");
		expect(markdown).toContain('data-underrock-block-id="qubit"');
	});

	it("takes only the section of `![[Note#Heading]]`", async () => {
		const { markdown } = await book("![[2. Qubits#Bloch]]");
		expect(markdown).toContain("## Bloch");
		expect(markdown).toContain(`La esfera.${lineMarker(4, "Fisica/2. Qubits.md")}`);
		expect(markdown).not.toContain("Colapsa");
		expect(markdown).not.toContain("Un qubit");
	});

	it("includes notes within included notes, and skips a note that would include itself", async () => {
		expect((await book("![[Padre]]")).included).toEqual(["Padre.md", "Hija.md"]);
		const loop = await book("![[Bucle]]");
		expect(loop.included).toEqual(["Bucle.md"]);
		expect(loop.markdown).toContain("![[Bucle]]");
	});

	it("leaves images, block embeds, missing notes, embeds within text and code alone", async () => {
		const markdown = "![[foto.png]]\n![[2. Qubits#^qubit]]\n![[No existe]]\nVer ![[2. Qubits]] aquí\n```\n![[2. Qubits]]\n```";
		const result = await book(markdown);
		expect(result.included).toEqual([]);
		expect(result.markdown).not.toContain("# 2. Qubits");
	});
});
