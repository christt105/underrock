// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { SHORT_CODE_LINES, markLayoutHints } from "./markLayoutHints";

function hints(html: string): HTMLElement {
	const root = document.createElement("div");
	root.innerHTML = html;
	markLayoutHints(root);
	return root;
}

describe("markLayoutHints", () => {
	it("keeps short code blocks together and lets long ones split", () => {
		const short = "line\n".repeat(SHORT_CODE_LINES);
		const long = "line\n".repeat(SHORT_CODE_LINES + 1);
		const root = hints(`<pre id="a"><code>${short}</code></pre><pre id="b"><code>${long}</code></pre>`);
		expect(root.querySelector("#a")?.classList.contains("underrock-short")).toBe(true);
		expect(root.querySelector("#b")?.classList.contains("underrock-short")).toBe(false);
	});

	it("turns inline page-break styles into a class Paged.js understands", () => {
		const root = hints('<div style="page-break-after: always;"></div><div style="break-after:page"></div><div style="color: red"></div>');
		expect(root.querySelectorAll(".underrock-page-break")).toHaveLength(2);
	});
});
