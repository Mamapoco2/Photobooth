import { useMemo, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import {
  Download,
  Share2,
  Sparkles,
  Type,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { FILTER_PRESETS, getFilterCss } from '@/lib/filters'
import { renderPhotostripToBlob } from '@/lib/canvasExport'
import {
  DEFAULT_STRIP_LAYOUT,
  PREVIEW_STRIP_WIDTH_PX,
  PREVIEW_GAP_PX,
  STRIP_LAYOUT_2X2,
} from '@/lib/constants'
import { getTemplateById } from '@/lib/templates'
import { clamp } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const PAN_LIMIT = 80

export function EditorCanvas({
  photos,
  templateId,
  filterId,
  onFilterIdChange,
  caption,
  onCaptionChange,
  showDate,
  onShowDateChange,
  pans,
  onPansChange,
  stripLayout = DEFAULT_STRIP_LAYOUT,
}) {
  const template = useMemo(() => getTemplateById(templateId), [templateId])

  const [exportMime, setExportMime] = useState('png')
  const [busy, setBusy] = useState(false)

  const filterCss = getFilterCss(filterId)

  const stripClass = cn(
    'rounded-[2rem] border border-white/15 p-5 shadow-2xl ring-1 ring-white/10 bg-gradient-to-br',
    template.tailwindPreview,
  )

  const photoGridClass = cn(
    stripLayout === STRIP_LAYOUT_2X2
      ? 'grid grid-cols-2 gap-3'
      : 'flex flex-col gap-4',
  )

  function updatePan(i, updater) {
    onPansChange((prev) => {
      const n = [...prev]
      const cur = n[i] ?? { x: 0, y: 0 }
      n[i] = typeof updater === 'function' ? updater(cur) : updater
      return n
    })
  }

  async function buildBlob() {
    return renderPhotostripToBlob({
      photoDataUrls: photos,
      templateId,
      filterCss,
      pans,
      stripLayout,
      previewStripWidth: PREVIEW_STRIP_WIDTH_PX,
      previewGap: PREVIEW_GAP_PX,
      caption,
      showDate,
      mime: exportMime === 'jpeg' ? 'jpeg' : 'png',
    })
  }

  async function handleDownload() {
    setBusy(true)
    try {
      const { blob } = await buildBlob()
      const ext = exportMime === 'jpeg' ? 'jpg' : 'png'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `photobooth-strip-${Date.now()}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  async function handleShare() {
    setBusy(true)
    try {
      const { blob } = await buildBlob()
      const ext = exportMime === 'jpeg' ? 'jpg' : 'png'
      const file = new File([blob], `photobooth-strip.${ext}`, {
        type: blob.type,
      })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Photobooth strip',
          text: caption || 'Photobooth strip',
        })
      } else if (navigator.share) {
        await navigator.share({
          title: 'Photobooth strip',
          text: caption || 'Photobooth strip',
          url: window.location.href,
        })
      }
    } catch {
      // cancelled or unsupported
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start">
      <Motion.div
        layout
        className="mx-auto w-full max-w-[320px]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={stripClass}>
          <div className="flex flex-col gap-4">
            {(caption.trim() || showDate) && (
              <div className="text-center text-white drop-shadow-md">
                {caption.trim() ? (
                  <p className="text-base font-semibold tracking-tight">
                    {caption}
                  </p>
                ) : null}
                {showDate ? (
                  <p className="mt-1 text-xs text-white/75">
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: 'medium',
                    }).format(new Date())}
                  </p>
                ) : null}
              </div>
            )}
            <div className={photoGridClass}>
              {photos.map((src, i) => (
                <div
                  key={`${i}-${src.slice(0, 24)}`}
                  className={cn(
                    'relative mx-auto w-full overflow-hidden rounded-2xl border border-white/25 bg-black/20 shadow-lg ring-1 ring-black/10',
                    stripLayout === STRIP_LAYOUT_2X2 ? 'max-w-none' : 'max-w-[280px]',
                  )}
                >
                  <div className="aspect-[3/4] w-full touch-none">
                    <Motion.img
                      src={src}
                      alt={`Shot ${i + 1}`}
                      draggable={false}
                      className="h-full w-full cursor-grab select-none object-cover active:cursor-grabbing"
                      style={{
                        filter: filterCss,
                      }}
                      drag
                      dragMomentum={false}
                      dragElastic={0}
                      dragConstraints={{
                        left: -PAN_LIMIT,
                        right: PAN_LIMIT,
                        top: -PAN_LIMIT,
                        bottom: PAN_LIMIT,
                      }}
                      animate={{
                        x: pans[i]?.x ?? 0,
                        y: pans[i]?.y ?? 0,
                      }}
                      onDragEnd={(_, info) => {
                        updatePan(i, (prev) => ({
                          x: clamp(
                            prev.x + info.offset.x,
                            -PAN_LIMIT,
                            PAN_LIMIT,
                          ),
                          y: clamp(
                            prev.y + info.offset.y,
                            -PAN_LIMIT,
                            PAN_LIMIT,
                          ),
                        }))
                      }}
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/45 to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Motion.div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-display text-2xl font-semibold normal-case">
            Edit & export
          </CardTitle>
          <CardDescription>
            Drag shots inside their frames. Use print filters for a final pass
            on the whole strip (they layer on top of your camera look from
            capture).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="adjust" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="adjust" className="gap-1.5">
                <Sparkles className="size-4" aria-hidden />
                Adjust
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-1.5">
                <Type className="size-4" aria-hidden />
                Text
              </TabsTrigger>
              <TabsTrigger value="export" className="gap-1.5">
                <Download className="size-4" aria-hidden />
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="adjust" className="space-y-4">
              <div className="grid max-h-[280px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                {Object.values(FILTER_PRESETS).map((f) => (
                  <Button
                    key={f.id}
                    type="button"
                    size="sm"
                    variant={filterId === f.id ? 'default' : 'secondary'}
                    className="justify-center text-xs"
                    onClick={() => onFilterIdChange(f.id)}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-[rgb(var(--muted))]">
                Tip: drag each photo to reframe inside its slot — exports honor
                your panning.
              </p>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  value={caption}
                  onChange={(e) => onCaptionChange(e.target.value)}
                  placeholder="Best day ever"
                />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]/70 px-3 py-3">
                <div className="flex items-start gap-2">
                  <CalendarIcon className="mt-0.5 size-4 text-[rgb(var(--muted))]" />
                  <div>
                    <p className="text-sm font-medium">Show date</p>
                    <p className="text-xs text-[rgb(var(--muted))]">
                      Adds today’s date under your caption on the strip.
                    </p>
                  </div>
                </div>
                <Switch checked={showDate} onCheckedChange={onShowDateChange} />
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={exportMime}
                  onValueChange={(v) => setExportMime(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (lossless)</SelectItem>
                    <SelectItem value="jpeg">JPEG (smaller)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  className="flex-1 gap-2"
                  disabled={busy}
                  onClick={handleDownload}
                >
                  <Download className="size-4" aria-hidden />
                  {busy ? 'Working…' : 'Download image'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 gap-2"
                  disabled={busy}
                  onClick={handleShare}
                >
                  <Share2 className="size-4" aria-hidden />
                  Share
                </Button>
              </div>
              <p className="text-xs text-[rgb(var(--muted))]">
                Sharing uses your device’s native sheet when supported; otherwise
                you can always download and post manually.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
