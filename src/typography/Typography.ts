export interface Typography {
	/** CSS font family, or a comma-separated stack. Empty uses the built-in default. */
	readonly bodyFont: string;
	readonly headingFont: string;
	readonly codeFont: string;
	/** Sizes in points. */
	readonly bodySize: number;
	readonly h1Size: number;
	readonly h2Size: number;
	readonly h3Size: number;
	readonly h4Size: number;
	readonly h5Size: number;
	readonly h6Size: number;
	readonly lineHeight: number;
	readonly textColor: string;
	readonly headingColor: string;
	/** Vault folder whose font files become available by name. */
	readonly fontsFolder: string;
}

export const DEFAULT_TYPOGRAPHY: Typography = {
	bodyFont: "",
	headingFont: "",
	codeFont: "",
	bodySize: 11,
	h1Size: 22,
	h2Size: 17,
	h3Size: 14,
	h4Size: 12,
	h5Size: 11,
	h6Size: 11,
	lineHeight: 1.5,
	textColor: "#1a1a1a",
	headingColor: "#1a1a1a",
	fontsFolder: "",
};
