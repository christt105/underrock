/** The parts of Electron's `<webview>` element used to print documents. */
export interface PrintWebview extends HTMLElement {
	executeJavaScript(code: string): Promise<unknown>;
	printToPDF(options: { preferCSSPageSize?: boolean; printBackground?: boolean }): Promise<Uint8Array>;
}
