import type { CleanOptions } from "./CleanOptions";
import { markLayoutHints } from "../pagination/markLayoutHints";
import type { FigureEntry } from "./FigureEntry";
import { numberEquations } from "./equations";
import { wrapFigures } from "./figures";
import { assignHeadingIds } from "./headingIds";

const APP_CHROME = [
	".copy-code-button",
	".collapse-indicator",
	".heading-collapse-indicator",
	".markdown-embed-link",
	".edit-block-button",
	".frontmatter",
	".frontmatter-container",
	".metadata-container",
	".mod-header",
	".mod-footer",
	".embedded-backlinks",
].join(", ");

/**
 * Strips Obsidian UI from rendered Markdown and rewrites links so the HTML stands on its own.
 * Returns the figures it numbered.
 */
export function cleanRenderedHtml(root: HTMLElement, options: CleanOptions): FigureEntry[] {
	root.querySelectorAll(APP_CHROME).forEach((el) => el.remove());
	unwrapBlockWrappers(root);
	const figures = wrapFigures(root, options.lang);
	const equations = numberEquations(root, options.lang);
	const headingIds = assignHeadingIds(root);
	const blockTargets = new Map<string, BlockTarget>();
	for (const target of [...figures, ...equations]) {
		if (target.blockId !== "" && !blockTargets.has(target.blockId)) blockTargets.set(target.blockId, target);
	}
	rewriteInternalLinks(root, headingIds, blockTargets, options);
	root.querySelectorAll("a.tag").forEach(unwrap);
	markLayoutHints(root);
	return figures;
}

function unwrapBlockWrappers(root: HTMLElement): void {
	for (const wrapper of Array.from(root.querySelectorAll("div"))) {
		const classes = Array.from(wrapper.classList);
		if (classes.length > 0 && classes.every((c) => c.startsWith("el-"))) {
			unwrap(wrapper);
		}
	}
}

/** A numbered figure or equation that links to its block id point at. */
interface BlockTarget {
	readonly id: string;
	readonly label: string;
}

function rewriteInternalLinks(
	root: HTMLElement,
	headingIds: Map<string, string>,
	blockTargets: Map<string, BlockTarget>,
	options: CleanOptions,
): void {
	for (const link of Array.from(root.querySelectorAll<HTMLAnchorElement>("a.internal-link"))) {
		const target = link.getAttribute("data-href") ?? link.getAttribute("href") ?? "";
		if (target.startsWith("#^")) {
			const blockId = target.slice(2);
			const block = blockTargets.get(blockId);
			if (block !== undefined) {
				// Without an alias Obsidian shows the link itself, such as "^chart"; show the number instead.
				if ((link.textContent ?? "").trim().endsWith(`^${blockId}`)) link.textContent = block.label;
				link.setAttribute("href", `#${block.id}`);
				link.removeAttribute("target");
				continue;
			}
		} else if (target.startsWith("#")) {
			const id = headingIds.get(target.slice(1));
			if (id !== undefined) {
				link.setAttribute("href", `#${id}`);
				link.removeAttribute("target");
				continue;
			}
		}
		if (options.links === "obsidian-uri" && target !== "") {
			const vault = encodeURIComponent(options.vaultName);
			link.setAttribute("href", `obsidian://open?vault=${vault}&file=${encodeURIComponent(target)}`);
			link.removeAttribute("target");
			continue;
		}
		unwrap(link);
	}
}

function unwrap(el: Element): void {
	el.replaceWith(...Array.from(el.childNodes));
}
