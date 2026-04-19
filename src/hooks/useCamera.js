import { useCallback, useRef, useState } from 'react'

export function useCamera({ mirror = true } = {}) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        await video.play()
      }
      setReady(true)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Camera unavailable')
      setReady(false)
    }
  }, [])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setReady(false)
  }, [])

  const captureFrame = useCallback(
    (quality = 0.92, filterCss = 'none') => {
      const video = videoRef.current
      if (!video || video.readyState < 2) return null
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      if (mirror) {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
      }
      if (filterCss && filterCss !== 'none') {
        ctx.filter = filterCss
      }
      ctx.drawImage(video, 0, 0)
      ctx.filter = 'none'
      return canvas.toDataURL('image/jpeg', quality)
    },
    [mirror],
  )

  return { videoRef, streamRef, start, stop, captureFrame, error, ready }
}
