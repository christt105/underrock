import type { PageSetup } from "./PageSetup";

/** The `@page` rule Paged.js uses for page size and margins. */
export function pageCss(setup: PageSetup): string {
	const margins = [setup.marginTopMm, setup.marginRightMm, setup.marginBottomMm, setup.marginLeftMm]
		.map((mm) => `${Math.max(0, mm)}mm`)
		.join(" ");
	return `@page {\n\tsize: ${setup.size} ${setup.landscape ? "landscape" : "portrait"};\n\tmargin: ${margins};\n}\n`;
}
