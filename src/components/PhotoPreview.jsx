import { motion as Motion } from 'framer-motion'
import { RotateCcw, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GifPreview } from '@/components/GifPreview'
import { DEFAULT_STRIP_LAYOUT, STRIP_LAYOUT_2X2 } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function PhotoPreview({
  photos,
  onRetake,
  onProceed,
  className,
  stripLayout = DEFAULT_STRIP_LAYOUT,
}) {
  return (
    <Card className={cn('w-full max-w-md mx-auto overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="font-display flex items-center justify-between gap-2 text-2xl font-semibold normal-case">
          Your strip
          <GifPreview photos={photos} className="hidden sm:block" />
        </CardTitle>
        <CardDescription>
          Preview your four shots. Retake if you want another run, or continue to
          templates and editing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={cn(
            'mx-auto w-full gap-3',
            stripLayout === STRIP_LAYOUT_2X2
              ? 'grid max-w-[280px] grid-cols-2'
              : 'flex w-[min(100%,280px)] flex-col',
          )}
        >
          {photos.map((src, i) => (
            <Motion.div
              key={`${i}-${src.slice(0, 32)}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-[var(--shadow-hero)]"
            >
              <div className="aspect-[3/4] w-full">
                <img
                  src={src}
                  alt={`Capture ${i + 1}`}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>
            </Motion.div>
          ))}
        </div>
        <GifPreview photos={photos} className="sm:hidden" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 gap-2"
            onClick={onRetake}
          >
            <RotateCcw className="size-4" aria-hidden />
            Retake
          </Button>
          <Button type="button" className="flex-1 gap-2" onClick={onProceed}>
            <Palette className="size-4" aria-hidden />
            Choose design
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
