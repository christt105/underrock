// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { keepLinksInDocument } from "./inDocumentLinks";

function click(el: Element): MouseEvent {
	const event = new MouseEvent("click", { bubbles: true, cancelable: true });
	el.dispatchEvent(event);
	return event;
}

describe("keepLinksInDocument", () => {
	it("scrolls to the target of a link within the document instead of following it", () => {
		document.body.innerHTML = '<p><a href="#figure-bloch"><strong>Figura 1</strong></a></p><figure id="figure-bloch"></figure>';
		const scroll = vi.fn();
		const figure = document.getElementById("figure-bloch");
		if (figure) figure.scrollIntoView = scroll;
		keepLinksInDocument(document);
		const event = click(document.querySelector("strong") as Element);
		expect(event.defaultPrevented).toBe(true);
		expect(scroll).toHaveBeenCalledOnce();
	});

	it("leaves other links alone", () => {
		document.body.innerHTML = '<a href="https://obsidian.md">web</a>';
		keepLinksInDocument(document);
		expect(click(document.querySelector("a") as Element).defaultPrevented).toBe(false);
	});
});
