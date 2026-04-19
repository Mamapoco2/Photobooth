import { motion as Motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { TEMPLATES } from '@/lib/templates'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export function TemplateSelector({ value, onChange, className }) {
  return (
    <div className={cn('w-full', className)}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[rgb(var(--foreground))]">
            Photostrip themes
          </h2>
          <p className="text-sm text-[rgb(var(--muted))]">
            Switch anytime — the preview updates instantly.
          </p>
        </div>
        <Badge variant="outline">Live</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TEMPLATES.map((t, idx) => {
          const active = t.id === value
          return (
            <Motion.button
              key={t.id}
              type="button"
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onChange(t.id)}
              className={cn(
                'group relative overflow-hidden rounded-2xl border p-[1px] text-left shadow-lg transition-colors',
                active
                  ? 'border-[rgb(var(--accent))] ring-2 ring-[rgb(var(--accent))]/35'
                  : 'border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/40',
              )}
            >
              <div
                className={cn(
                  'h-24 bg-gradient-to-br p-4 transition-transform group-hover:scale-[1.01]',
                  t.tailwindPreview,
                )}
              />
              <div className="space-y-1 rounded-b-2xl bg-[rgb(var(--card))]/90 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[rgb(var(--foreground))]">
                    {t.name}
                  </p>
                  {active && (
                    <span className="flex size-7 items-center justify-center rounded-full bg-[rgb(var(--accent))] text-[rgb(var(--accent-fg))] shadow-md">
                      <Check className="size-4" aria-hidden />
                    </span>
                  )}
                </div>
                <p className="text-xs leading-snug text-[rgb(var(--muted))]">
                  {t.description}
                </p>
              </div>
            </Motion.button>
          )
        })}
      </div>
    </div>
  )
}
