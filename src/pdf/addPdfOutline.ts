import { PDFDict, PDFHexString, PDFName, PDFNull, PDFNumber } from "pdf-lib";
import type { PDFDocument, PDFPage } from "pdf-lib";
import type { HeadingPosition } from "./HeadingPosition";
import type { OutlineNode } from "./OutlineNode";

/** Adds a bookmark for each heading, nested by level, and opens the bookmarks panel. */
export function addPdfOutline(doc: PDFDocument, headings: readonly HeadingPosition[]): void {
	const pages = doc.getPages();
	const entries = headings.filter((heading) => heading.title !== "" && pages[heading.pageIndex] !== undefined);
	if (entries.length === 0) return;

	const root: OutlineNode = { level: 0, ref: doc.context.nextRef(), children: [] };
	const stack = [root];
	for (const heading of entries) {
		while ((stack[stack.length - 1]?.level ?? 0) >= heading.level) stack.pop();
		const node: OutlineNode = { level: heading.level, ref: doc.context.nextRef(), heading, children: [] };
		(stack[stack.length - 1] ?? root).children.push(node);
		stack.push(node);
	}

	const rootDict = PDFDict.withContext(doc.context);
	rootDict.set(PDFName.of("Type"), PDFName.of("Outlines"));
	const count = writeChildren(doc, pages, root, rootDict);
	rootDict.set(PDFName.of("Count"), PDFNumber.of(count));
	doc.context.assign(root.ref, rootDict);
	doc.catalog.set(PDFName.of("Outlines"), root.ref);
	doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
}

/** Writes the children of `parent` and links them into `parentDict`. Returns how many entries are below it. */
function writeChildren(doc: PDFDocument, pages: PDFPage[], parent: OutlineNode, parentDict: PDFDict): number {
	const { children } = parent;
	const first = children[0];
	const last = children[children.length - 1];
	if (first === undefined || last === undefined) return 0;
	parentDict.set(PDFName.of("First"), first.ref);
	parentDict.set(PDFName.of("Last"), last.ref);

	let count = 0;
	children.forEach((node, i) => {
		const heading = node.heading;
		const page = heading && pages[heading.pageIndex];
		if (!heading || !page) return;
		const dict = PDFDict.withContext(doc.context);
		dict.set(PDFName.of("Title"), PDFHexString.fromText(heading.title));
		dict.set(PDFName.of("Parent"), parent.ref);
		const previous = children[i - 1];
		const next = children[i + 1];
		if (previous) dict.set(PDFName.of("Prev"), previous.ref);
		if (next) dict.set(PDFName.of("Next"), next.ref);
		dict.set(PDFName.of("Dest"), doc.context.obj([page.ref, PDFName.of("XYZ"), PDFNull, PDFNumber.of(destinationY(page, heading)), PDFNull]));
		const below = writeChildren(doc, pages, node, dict);
		if (below > 0) dict.set(PDFName.of("Count"), PDFNumber.of(below));
		doc.context.assign(node.ref, dict);
		count += 1 + below;
	});
	return count;
}

function destinationY(page: PDFPage, heading: HeadingPosition): number {
	const { height } = page.getSize();
	const scale = heading.pageHeight > 0 ? height / heading.pageHeight : 0.75;
	return Math.round(Math.max(0, Math.min(height, height - heading.top * scale)) * 100) / 100;
}
