const URL_PATTERN = /url\(\s*(["']?)([^"')]*)\1\s*\)/g;

/**
 * Resolves the relative `url()` references in `css` against `baseUrl`.
 * Paged.js resolves them against the page location and ignores `<base>`,
 * which throws inside a `srcdoc` frame whose location is `about:srcdoc`.
 */
export function absoluteCssUrls(css: string, baseUrl: string): string {
	return css.replace(URL_PATTERN, (match, quote: string, href: string) => {
		const target = href.trim();
		if (target === "" || target.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(target)) return match;
		try {
			return `url(${quote}${new URL(target, baseUrl).href}${quote})`;
		} catch {
			return match;
		}
	});
}
