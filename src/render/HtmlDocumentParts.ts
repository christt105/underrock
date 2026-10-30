export interface HtmlDocumentParts {
	readonly title: string;
	readonly lang: string;
	/** Resolves relative URLs (images, MathJax fonts) as the app would. */
	readonly baseUrl: string;
	readonly bodyHtml: string;
	readonly stylesheets: readonly string[];
	/** Styles that only apply on screen. Paged.js leaves them out of pagination. */
	readonly screenStylesheets: readonly string[];
	readonly scripts: readonly string[];
}
