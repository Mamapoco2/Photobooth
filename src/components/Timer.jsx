import { AnimatePresence, motion as Motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Timer({ value, className, label = 'Get ready' }) {
  return (
    <div
      className={cn(
        'pointer-events-none flex flex-col items-center justify-center gap-5',
        className,
      )}
    >
      <p className="font-display text-lg font-medium italic tracking-wide text-white/90 drop-shadow-md">
        {label}
      </p>
      <div className="relative flex h-40 w-40 items-center justify-center">
        <Motion.span
          className="absolute inset-0 rounded-full bg-white/12 blur-2xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.72, 0.45] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <AnimatePresence mode="popLayout">
          <Motion.span
            key={value}
            initial={{ opacity: 0, scale: 0.65, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.12, y: -12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="font-display relative z-[1] text-7xl font-semibold tabular-nums tracking-tight text-white drop-shadow-2xl sm:text-8xl"
          >
            {value}
          </Motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}
