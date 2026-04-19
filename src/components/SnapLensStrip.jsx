import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { snapLensEmoji } from '@/lib/snapLensHints'

function LensThumb({ lens }) {
  const [failed, setFailed] = useState(false)
  const src = lens.iconUrl || lens.preview?.imageUrl
  const emoji = snapLensEmoji(lens.name)

  if (!src || failed) {
    return (
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--card))] text-lg leading-none"
        aria-hidden
      >
        {emoji}
      </span>
    )
  }
  return (
    <img
      src={src}
      alt=""
      className="size-11 shrink-0 rounded-xl bg-[rgb(var(--card))] object-cover"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}

/**
 * Horizontal lens picker: live preview updates via Camera Kit session; capture uses the same session.
 */
export function SnapLensStrip({
  lenses,
  activeLensId,
  onSelectLens,
  onClearLens,
  disabled,
  busy,
  className,
}) {
  const handleKeyNav = useCallback(
    (e, action) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      action()
    },
    [],
  )

  return (
    <div className={cn('space-y-3', className)}>
      <div
        role="listbox"
        aria-label="Snap Lenses"
        className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-0.5"
      >
        <button
          type="button"
          role="option"
          aria-selected={activeLensId == null}
          disabled={disabled || busy}
          onClick={() => onClearLens?.()}
          onKeyDown={(e) =>
            handleKeyNav(e, () => onClearLens?.())
          }
          className={cn(
            'flex min-w-[5.5rem] shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-2 py-2.5 text-center transition-colors',
            activeLensId == null
              ? 'border-[rgb(var(--foreground))]/35 bg-[rgb(var(--foreground))]/10'
              : 'border-[rgb(var(--border))] bg-[rgb(var(--card))]/80 hover:bg-[rgb(var(--card))]',
            (disabled || busy) && 'pointer-events-none opacity-50',
          )}
        >
          <span
            className="flex size-11 items-center justify-center rounded-xl bg-[rgb(var(--pb-surface))] text-lg"
            aria-hidden
          >
            📷
          </span>
          <span className="max-w-[5.5rem] truncate text-[11px] font-medium leading-tight text-[rgb(var(--foreground))]">
            Original
          </span>
        </button>

        {lenses.map((lens) => {
          const selected = activeLensId === lens.id
          return (
            <button
              key={lens.id}
              type="button"
              role="option"
              aria-selected={selected}
              disabled={disabled || busy}
              onClick={() => onSelectLens(lens)}
              onKeyDown={(e) =>
                handleKeyNav(e, () => onSelectLens(lens))
              }
              className={cn(
                'flex min-w-[5.5rem] shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-2 py-2.5 text-center transition-colors',
                selected
                  ? 'border-[rgb(var(--foreground))]/35 bg-[rgb(var(--foreground))]/10'
                  : 'border-[rgb(var(--border))] bg-[rgb(var(--card))]/80 hover:bg-[rgb(var(--card))]',
                (disabled || busy) && 'pointer-events-none opacity-50',
              )}
            >
              <LensThumb lens={lens} />
              <span className="max-w-[5.5rem] truncate text-[11px] font-medium leading-tight text-[rgb(var(--foreground))]">
                {snapLensEmoji(lens.name)} {lens.name}
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-[11px] leading-relaxed text-[rgb(var(--muted))]">
        Tap to preview on the video above —{' '}
        <span className="font-medium text-[rgb(var(--foreground))]/90">
          START
        </span>{' '}
        saves the same lens on every frame. (Publish lenses in Lens Studio →
        Camera Kit group → env IDs.)
      </p>
    </div>
  )
}
