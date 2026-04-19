export const PHOTO_COUNT = 4
export const DEFAULT_COUNTDOWN_SEC = 3
export const CAPTURE_INTERVAL_MS = 1400
/** Full preview column width (px) — used to scale pans in export */
export const PREVIEW_STRIP_WIDTH_PX = 280
/** Gap between cells in 2×2 preview */
export const PREVIEW_GAP_PX = 12

/** @typedef {'1x4' | '2x2'} StripLayout */

/** Vertical strip: four frames stacked */
export const STRIP_LAYOUT_1X4 = /** @type {const} */ ('1x4')
/** Grid: two rows × two columns */
export const STRIP_LAYOUT_2X2 = /** @type {const} */ ('2x2')

export const DEFAULT_STRIP_LAYOUT = STRIP_LAYOUT_1X4

/** @deprecated use PREVIEW_STRIP_WIDTH_PX */
export const PREVIEW_SLOT_WIDTH_PX = PREVIEW_STRIP_WIDTH_PX
