export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 3;
export const ZOOM_STEP = 0.1;

export function clampZoom(zoom: number): number {
	return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(zoom * 100) / 100));
}

/** Zoom at which a page of `pageWidth` fills `availableWidth`, leaving `gutter` pixels on each side. */
export function fitWidthZoom(availableWidth: number, pageWidth: number, gutter = 16): number {
	if (pageWidth <= 0) return 1;
	return clampZoom((availableWidth - gutter * 2) / pageWidth);
}
