/** Snap Camera Kit — set in `.env` (see `.env.example`) */
export function getSnapApiToken() {
  const t = import.meta.env.VITE_SNAP_CAMERA_KIT_API_TOKEN
  return typeof t === 'string' && t.trim() ? t.trim() : ''
}

/** Comma-separated Lens Group IDs from [Lens Scheduler](https://my-lenses.snapchat.com/camera-kit/lens-scheduler) */
export function getSnapLensGroupIds() {
  const raw = import.meta.env.VITE_SNAP_LENS_GROUP_IDS
  if (typeof raw !== 'string' || !raw.trim()) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function isSnapConfigured() {
  return Boolean(getSnapApiToken())
}
