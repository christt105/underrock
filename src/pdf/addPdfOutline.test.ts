import { PDFArray, PDFDict, PDFDocument, PDFHexString, PDFName, PDFNumber, PDFRef } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { addPdfOutline } from "./addPdfOutline";

const A4 = { pageHeight: 1122.5 };

async function outlineOf(bytes: Uint8Array): Promise<{ doc: PDFDocument; root: PDFDict | undefined }> {
	const doc = await PDFDocument.load(bytes);
	const ref = doc.catalog.get(PDFName.of("Outlines"));
	return { doc, root: ref instanceof PDFRef ? doc.context.lookup(ref, PDFDict) : undefined };
}

function children(doc: PDFDocument, parent: PDFDict): PDFDict[] {
	const out: PDFDict[] = [];
	let ref = parent.get(PDFName.of("First"));
	while (ref instanceof PDFRef) {
		const dict = doc.context.lookup(ref, PDFDict);
		out.push(dict);
		ref = dict.get(PDFName.of("Next"));
	}
	return out;
}

function title(dict: PDFDict): string {
	return dict.lookup(PDFName.of("Title"), PDFHexString).decodeText();
}

describe("addPdfOutline", () => {
	it("nests bookmarks by heading level and points each at its page", async () => {
		const doc = await PDFDocument.create();
		doc.addPage([595, 842]);
		doc.addPage([595, 842]);
		addPdfOutline(doc, [
			{ level: 1, title: "Intro", pageIndex: 0, top: 100, ...A4 },
			{ level: 2, title: "Détails", pageIndex: 0, top: 500, ...A4 },
			{ level: 3, title: "Deeper", pageIndex: 1, top: 50, ...A4 },
			{ level: 2, title: "More", pageIndex: 1, top: 300, ...A4 },
			{ level: 1, title: "End", pageIndex: 1, top: 900, ...A4 },
			{ level: 1, title: "", pageIndex: 1, top: 950, ...A4 },
			{ level: 1, title: "Missing page", pageIndex: 5, top: 0, ...A4 },
		]);
		const { doc: loaded, root } = await outlineOf(await doc.save());
		expect(root).toBeDefined();
		if (!root) return;
		expect(root.lookup(PDFName.of("Count"), PDFNumber).asNumber()).toBe(5);
		expect(loaded.catalog.get(PDFName.of("PageMode"))).toBe(PDFName.of("UseOutlines"));

		const top = children(loaded, root);
		expect(top.map(title)).toEqual(["Intro", "End"]);
		const intro = top[0];
		expect(children(loaded, intro).map(title)).toEqual(["Détails", "More"]);
		expect(children(loaded, children(loaded, intro)[0]).map(title)).toEqual(["Deeper"]);
		expect(intro.lookup(PDFName.of("Count"), PDFNumber).asNumber()).toBe(3);

		const dest = intro.lookup(PDFName.of("Dest"), PDFArray);
		expect(dest.get(0)).toBe(loaded.getPages()[0]?.ref);
		expect(dest.lookup(3, PDFNumber).asNumber()).toBeCloseTo(842 - 100 * (842 / 1122.5), 1);
	});

	it("leaves the PDF alone without headings", async () => {
		const doc = await PDFDocument.create();
		doc.addPage();
		addPdfOutline(doc, []);
		const { root } = await outlineOf(await doc.save());
		expect(root).toBeUndefined();
	});
});
