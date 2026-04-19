import { forwardRef, useImperativeHandle, useRef } from 'react'
import { motion as Motion } from 'framer-motion'
import { CameraOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const Camera = forwardRef(function Camera(
  {
    videoRef,
    error,
    ready,
    className,
    mirrored = true,
    variant = 'default',
    filterCss = 'none',
  },
  ref,
) {
  const containerRef = useRef(null)

  useImperativeHandle(ref, () => containerRef.current)

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-3xl mx-auto', className)}>
      <Motion.div
        layout
        className={cn(
          'relative overflow-hidden shadow-[var(--shadow-hero)]',
          variant === 'editorial'
            ? 'rounded-[1.75rem] border-[3px] border-[rgb(var(--border))] bg-[rgb(var(--card))] ring-1 ring-black/[0.04]'
            : 'rounded-3xl border border-white/20 bg-black/30 shadow-2xl backdrop-blur-sm ring-1 ring-white/10',
        )}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            className={cn(
              'h-full w-full object-cover opacity-100 transition-[filter,opacity] duration-200',
              mirrored && 'scale-x-[-1]',
            )}
            style={{
              filter: filterCss && filterCss !== 'none' ? filterCss : undefined,
            }}
            playsInline
            muted
            autoPlay
          />
          {!ready && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white/80">
              Starting camera…
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center text-white">
              <CameraOff className="size-10 opacity-80" aria-hidden />
              <p className="text-sm leading-relaxed text-white/85">{error}</p>
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
      </Motion.div>
    </div>
  )
})

export { Camera }
