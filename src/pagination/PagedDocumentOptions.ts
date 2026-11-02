import type { PageSetup } from "./PageSetup";

export interface PagedDocumentOptions {
	readonly page: PageSetup;
	readonly lang: string;
	readonly baseUrl: string;
	/** Extra stylesheets applied after the base ones, such as typography settings. */
	readonly extraCss: readonly string[];
	/** Pages placed before the note, such as the list of figures. */
	readonly leadingHtml?: readonly string[];
}
