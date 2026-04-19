/** Live + export CSS filters (canvas & video) */
export const FILTER_PRESETS = {
  none: { id: 'none', label: 'Original', filter: 'none' },
  grayscale: { id: 'grayscale', label: 'B&W', filter: 'grayscale(1)' },
  sepia: { id: 'sepia', label: 'Sepia', filter: 'sepia(0.85) contrast(1.05)' },
  bright: { id: 'bright', label: 'Bright', filter: 'brightness(1.15) contrast(1.05)' },
  warm: {
    id: 'warm',
    label: 'Warm glow',
    filter:
      'sepia(0.12) saturate(1.15) hue-rotate(-8deg) brightness(1.03)',
  },
  cool: {
    id: 'cool',
    label: 'Cool tone',
    filter: 'hue-rotate(18deg) saturate(0.95) brightness(1.02)',
  },
  vivid: {
    id: 'vivid',
    label: 'Vivid',
    filter: 'saturate(1.35) contrast(1.08) brightness(1.03)',
  },
  noir: {
    id: 'noir',
    label: 'Noir',
    filter: 'grayscale(1) contrast(1.2) brightness(0.92)',
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    filter: 'hue-rotate(352deg) saturate(1.2) brightness(1.04)',
  },
  soft: {
    id: 'soft',
    label: 'Soft matte',
    filter: 'brightness(1.06) contrast(0.94) saturate(0.92)',
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    filter:
      'sepia(0.25) saturate(1.25) hue-rotate(-15deg) contrast(1.05)',
  },
}

export function getFilterCss(filterId) {
  return FILTER_PRESETS[filterId]?.filter ?? FILTER_PRESETS.none.filter
}
