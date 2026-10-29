import polyfill from "../../node_modules/pagedjs/dist/paged.polyfill.min.js?raw";

export const PAGINATED_EVENT = "underrock:paginated";
export const PAGE_COUNT_ATTRIBUTE = "data-underrock-pages";

const CONFIG = `window.PagedConfig = {
	auto: true,
	after: function (flow) {
		document.documentElement.setAttribute("${PAGE_COUNT_ATTRIBUTE}", String(flow.total));
		window.dispatchEvent(new CustomEvent("${PAGINATED_EVENT}", { detail: { pages: flow.total } }));
	},
};`;

/** Scripts that paginate the document with Paged.js as soon as it loads. */
export const PAGED_SCRIPTS: readonly string[] = [CONFIG, polyfill];
