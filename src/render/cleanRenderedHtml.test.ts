// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import type { CleanOptions } from "./CleanOptions";
import { cleanRenderedHtml } from "./cleanRenderedHtml";

const TEXT_LINKS: CleanOptions = { links: "text", vaultName: "My Vault" };

function clean(html: string, options: CleanOptions = TEXT_LINKS): HTMLElement {
	const root = document.createElement("div");
	root.innerHTML = html;
	cleanRenderedHtml(root, options);
	return root;
}

describe("cleanRenderedHtml", () => {
	it("removes app controls like copy buttons and fold indicators", () => {
		const root = clean(
			'<div class="el-pre"><pre><code>x</code><button class="copy-code-button">Copy</button></pre></div>' +
				'<div class="el-h2"><h2><div class="heading-collapse-indicator collapse-indicator"></div>Title</h2></div>',
		);
		expect(root.querySelector(".copy-code-button")).toBeNull();
		expect(root.querySelector(".collapse-indicator")).toBeNull();
	});

	it("unwraps the per-block el-* wrappers so blocks are siblings", () => {
		const root = clean('<div class="el-h1"><h1>A</h1></div><div class="el-p"><p>B</p></div><div class="callout el-x"></div>');
		expect(Array.from(root.children).map((c) => c.tagName)).toEqual(["H1", "P", "DIV"]);
		expect(root.querySelector(".callout")).not.toBeNull();
	});

	it("points same-note heading links at the heading id", () => {
		const root = clean('<h2 data-heading="Results">Results</h2><p><a class="internal-link" data-href="#Results" href="#Results" target="_blank">see</a></p>');
		const link = root.querySelector("a");
		expect(link?.getAttribute("href")).toBe("#results");
		expect(link?.hasAttribute("target")).toBe(false);
	});

	it("turns links to other notes into plain text by default", () => {
		const root = clean('<p><a class="internal-link" data-href="Other note" href="Other note">Other</a></p>');
		expect(root.querySelector("a")).toBeNull();
		expect(root.textContent).toBe("Other");
	});

	it("can turn links to other notes into obsidian:// links", () => {
		const root = clean('<p><a class="internal-link" data-href="Folder/Other note#Part">Other</a></p>', {
			links: "obsidian-uri",
			vaultName: "My Vault",
		});
		expect(root.querySelector("a")?.getAttribute("href")).toBe(
			"obsidian://open?vault=My%20Vault&file=Folder%2FOther%20note%23Part",
		);
	});

	it("leaves external links alone and turns tags into text", () => {
		const root = clean('<p><a class="external-link" href="https://example.com">web</a> <a class="tag" href="#idea">#idea</a></p>');
		expect(root.querySelector("a.external-link")?.getAttribute("href")).toBe("https://example.com");
		expect(root.querySelector("a.tag")).toBeNull();
		expect(root.textContent).toBe("web #idea");
	});
});
