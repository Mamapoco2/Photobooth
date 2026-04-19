import { getTemplateById } from '@/lib/templates'
import { DEFAULT_STRIP_LAYOUT, STRIP_LAYOUT_2X2 } from '@/lib/constants'

/**
 * @typedef {{ type: 'linear'; angle: number; stops: [number, string][] }} GradientSpec
 */

const EXPORT_STRIP_WIDTH = 1080

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {GradientSpec} spec
 */
function fillGradient(ctx, w, h, spec) {
  const rad = ((spec.angle - 90) * Math.PI) / 180
  const x2 = w * Math.cos(rad)
  const y2 = h * Math.sin(rad)
  const g = ctx.createLinearGradient(0, 0, x2, y2)
  for (const [t, c] of spec.stops) {
    g.addColorStop(t, c)
  }
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function drawImageCoverInClip(ctx, img, x, y, w, h, panX, panY, filterCss) {
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  if (!iw || !ih) return

  const scale = Math.max(w / iw, h / ih)
  const dw = iw * scale
  const dh = ih * scale
  const cx = x + (w - dw) / 2 + panX
  const cy = y + (h - dh) / 2 + panY

  ctx.save()
  ctx.filter = filterCss || 'none'
  ctx.drawImage(img, cx, cy, dw, dh)
  ctx.filter = 'none'
  ctx.restore()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * @param {object} params
 * @param {string[]} params.photoDataUrls
 * @param {string} params.templateId
 * @param {string} params.filterCss
 * @param {{ x: number; y: number }[]} params.pans
 * @param {string} [params.stripLayout]
 * @param {number} [params.previewStripWidth]
 * @param {number} [params.previewGap]
 * @param {string} params.caption
 * @param {boolean} params.showDate
 * @param {'png' | 'jpeg'} params.mime
 */
export async function renderPhotostripToBlob({
  photoDataUrls,
  templateId,
  filterCss,
  pans,
  stripLayout = DEFAULT_STRIP_LAYOUT,
  previewStripWidth = 280,
  previewGap = 12,
  caption,
  showDate,
  mime,
}) {
  const template = getTemplateById(templateId)
  const style = template.export
  const scale = EXPORT_STRIP_WIDTH / previewStripWidth

  const pad = style.padding * scale
  const gap = style.gap * scale
  const corner = style.cornerRadius * scale

  const hasHeader = Boolean(caption.trim()) || showDate
  const headerBlock = hasHeader ? Math.round(72 * scale) : 0

  const imgs = await Promise.all(photoDataUrls.map((u) => loadImage(u)))

  let canvas
  let ctx

  if (stripLayout === STRIP_LAYOUT_2X2) {
    const innerW = EXPORT_STRIP_WIDTH - pad * 2
    const slotW = (innerW - gap) / 2
    const slotH = Math.round((slotW * 4) / 3)
    const gridH = slotH * 2 + gap

    const totalH =
      pad + headerBlock + gridH + pad + Math.round(40 * scale)

    canvas = document.createElement('canvas')
    canvas.width = EXPORT_STRIP_WIDTH
    canvas.height = Math.max(200, Math.round(totalH))

    ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unsupported')

    fillGradient(ctx, canvas.width, canvas.height, style.gradient)

    let y = pad
    if (hasHeader) {
      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const cx = canvas.width / 2
      let ty = y
      if (caption.trim()) {
        ctx.font = style.captionFont.replace(
          /(\d+)px/,
          (_, n) => `${Math.round(+n * scale)}px`,
        )
        ctx.fillStyle = style.captionColor
        ctx.fillText(caption.trim(), cx, ty, canvas.width - pad * 2)
        ty += Math.round(34 * scale)
      }
      if (showDate) {
        const dateStr = new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
        }).format(new Date())
        ctx.font = style.dateFont.replace(
          /(\d+)px/,
          (_, n) => `${Math.round(+n * scale)}px`,
        )
        ctx.fillStyle = style.dateColor
        ctx.fillText(dateStr, cx, ty, canvas.width - pad * 2)
      }
      ctx.restore()
      y += headerBlock
    }

    const cellPreviewW = (previewStripWidth - previewGap) / 2
    const panScale = slotW / cellPreviewW

    const positions = [
      { x: pad, y },
      { x: pad + slotW + gap, y },
      { x: pad, y: y + slotH + gap },
      { x: pad + slotW + gap, y: y + slotH + gap },
    ]

    for (let i = 0; i < imgs.length; i++) {
      const pos = positions[i]
      const x = pos.x
      const yy = pos.y
      const w = slotW
      const h = slotH

      if (style.glow) {
        ctx.save()
        ctx.shadowColor = 'rgba(168, 85, 247, 0.35)'
        ctx.shadowBlur = 28 * scale
        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        ctx.beginPath()
        roundRectPath(ctx, x, yy, w, h, corner)
        ctx.fill()
        ctx.restore()
      }

      const panX = (pans[i]?.x ?? 0) * panScale
      const panY = (pans[i]?.y ?? 0) * panScale

      ctx.save()
      ctx.beginPath()
      roundRectPath(ctx, x, yy, w, h, corner)
      ctx.clip()
      drawImageCoverInClip(ctx, imgs[i], x, yy, w, h, panX, panY, filterCss)
      ctx.restore()

      ctx.save()
      ctx.beginPath()
      roundRectPath(ctx, x, yy, w, h, corner)
      if (style.kind === 'minimal') {
        ctx.strokeStyle = 'rgba(15,23,42,0.16)'
        ctx.lineWidth = Math.max(1, 1.25 * scale)
      } else {
        ctx.strokeStyle = `rgba(255,255,255,${style.kind === 'pastel' ? 0.5 : 0.28})`
        ctx.lineWidth = Math.max(1, 1.6 * scale)
      }
      ctx.stroke()
      ctx.restore()
    }
  } else {
    const slotW = EXPORT_STRIP_WIDTH - pad * 2
    const slotH = Math.round((slotW * 4) / 3)

    const totalH =
      pad +
      headerBlock +
      photoDataUrls.length * slotH +
      (photoDataUrls.length - 1) * gap +
      pad +
      Math.round(40 * scale)

    canvas = document.createElement('canvas')
    canvas.width = EXPORT_STRIP_WIDTH
    canvas.height = Math.max(200, Math.round(totalH))

    ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unsupported')

    fillGradient(ctx, canvas.width, canvas.height, style.gradient)

    let y = pad
    if (hasHeader) {
      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const cx = canvas.width / 2
      let ty = y
      if (caption.trim()) {
        ctx.font = style.captionFont.replace(
          /(\d+)px/,
          (_, n) => `${Math.round(+n * scale)}px`,
        )
        ctx.fillStyle = style.captionColor
        ctx.fillText(caption.trim(), cx, ty, canvas.width - pad * 2)
        ty += Math.round(34 * scale)
      }
      if (showDate) {
        const dateStr = new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
        }).format(new Date())
        ctx.font = style.dateFont.replace(
          /(\d+)px/,
          (_, n) => `${Math.round(+n * scale)}px`,
        )
        ctx.fillStyle = style.dateColor
        ctx.fillText(dateStr, cx, ty, canvas.width - pad * 2)
      }
      ctx.restore()
      y += headerBlock
    }

    const panScale = slotW / previewStripWidth

    for (let i = 0; i < imgs.length; i++) {
      const x = pad
      const w = slotW
      const h = slotH

      if (style.glow) {
        ctx.save()
        ctx.shadowColor = 'rgba(168, 85, 247, 0.35)'
        ctx.shadowBlur = 28 * scale
        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        ctx.beginPath()
        roundRectPath(ctx, x, y, w, h, corner)
        ctx.fill()
        ctx.restore()
      }

      const panX = (pans[i]?.x ?? 0) * panScale
      const panY = (pans[i]?.y ?? 0) * panScale

      ctx.save()
      ctx.beginPath()
      roundRectPath(ctx, x, y, w, h, corner)
      ctx.clip()
      drawImageCoverInClip(ctx, imgs[i], x, y, w, h, panX, panY, filterCss)
      ctx.restore()

      ctx.save()
      ctx.beginPath()
      roundRectPath(ctx, x, y, w, h, corner)
      if (style.kind === 'minimal') {
        ctx.strokeStyle = 'rgba(15,23,42,0.16)'
        ctx.lineWidth = Math.max(1, 1.25 * scale)
      } else {
        ctx.strokeStyle = `rgba(255,255,255,${style.kind === 'pastel' ? 0.5 : 0.28})`
        ctx.lineWidth = Math.max(1, 1.6 * scale)
      }
      ctx.stroke()
      ctx.restore()

      y += slotH + gap
    }
  }

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Blob export failed'))),
      mime === 'jpeg' ? 'image/jpeg' : 'image/png',
      mime === 'jpeg' ? 0.95 : undefined,
    )
  })

  return { blob, width: canvas.width, height: canvas.height }
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

export { EXPORT_STRIP_WIDTH }
