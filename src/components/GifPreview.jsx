import { useEffect, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { Film } from 'lucide-react'
import { cn } from '@/lib/utils'

const FRAME_MS = 450

export function GifPreview({ photos, className }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (!photos.length) return undefined
    const id = window.setInterval(() => {
      setI((v) => (v + 1) % photos.length)
    }, FRAME_MS)
    return () => window.clearInterval(id)
  }, [photos.length])

  if (!photos.length) return null

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]/70 px-3 py-2 text-left shadow-inner',
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-xl bg-black/70">
        <AnimatePresence mode="wait">
          <Motion.img
            key={photos[i]}
            src={photos[i]}
            alt=""
            className="h-full w-full rounded-xl object-cover"
            initial={{ opacity: 0.2, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-[rgb(var(--foreground))]">
          <Film className="size-3.5 opacity-70" aria-hidden />
          Burst preview
        </p>
        <p className="text-[11px] text-[rgb(var(--muted))]">
          Quick loop of your captures
        </p>
      </div>
    </div>
  )
}
