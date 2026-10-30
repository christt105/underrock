import { PAGE_COUNT_ATTRIBUTE, PAGINATED_EVENT } from "../pagination/pagedScripts";

const TIMEOUT_MS = 60000;

/** Resolves with the frame's document once Paged.js has laid out every page. */
export function waitForPagination(frame: HTMLIFrameElement): Promise<Document> {
	return new Promise((resolve, reject) => {
		const timeout = window.setTimeout(() => reject(new Error("Pagination timed out")), TIMEOUT_MS);
		const done = (doc: Document) => {
			window.clearTimeout(timeout);
			resolve(doc);
		};
		frame.addEventListener(
			"load",
			() => {
				const doc = frame.contentDocument;
				const win = frame.contentWindow;
				if (doc === null || win === null) return reject(new Error("The preview frame has no document"));
				if (doc.documentElement.hasAttribute(PAGE_COUNT_ATTRIBUTE)) return done(doc);
				win.addEventListener(PAGINATED_EVENT, () => done(doc), { once: true });
			},
			{ once: true },
		);
	});
}
