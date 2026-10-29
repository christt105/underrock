/** Code blocks up to this many lines are kept on one page. */
export const SHORT_CODE_LINES = 15;

const INLINE_PAGE_BREAK = /(?:page-break-after\s*:\s*always|break-after\s*:\s*page)/i;

/** Marks elements whose page-break behaviour depends on content Paged.js can't see from CSS alone. */
export function markLayoutHints(root: HTMLElement): void {
	for (const pre of Array.from(root.querySelectorAll("pre"))) {
		const lines = (pre.textContent ?? "").replace(/\n$/, "").split("\n").length;
		if (lines <= SHORT_CODE_LINES) pre.classList.add("underrock-short");
	}
	for (const el of Array.from(root.querySelectorAll<HTMLElement>("[style]"))) {
		if (INLINE_PAGE_BREAK.test(el.getAttribute("style") ?? "")) el.classList.add("underrock-page-break");
	}
}
