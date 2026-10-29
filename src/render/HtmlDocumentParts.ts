export interface HtmlDocumentParts {
	readonly title: string;
	readonly lang: string;
	/** Resolves relative URLs (images, MathJax fonts) as the app would. */
	readonly baseUrl: string;
	readonly bodyHtml: string;
	readonly stylesheets: readonly string[];
	readonly scripts: readonly string[];
}
