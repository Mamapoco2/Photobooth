import { useCallback, useEffect, useRef, useState } from 'react'
import { getSnapApiToken, getSnapLensGroupIds } from '@/lib/snapEnv'

/** Same lens can appear when multiple group IDs are listed — keep one entry per id. */
function dedupeLenses(list) {
  const map = new Map()
  for (const L of list) {
    if (!map.has(L.id)) map.set(L.id, L)
  }
  return [...map.values()]
}

/**
 * Snap Camera Kit session: WebGL lenses on a canvas + JPEG capture from the `capture` render target.
 * @param {{ enabled: boolean; onInitFailed?: (err: Error) => void }} opts
 */
export function useSnapCameraKit({ enabled, onInitFailed }) {
  const [canvasNode, setCanvasNode] = useState(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [lenses, setLenses] = useState(/** @type {import('@snap/camera-kit').Lens[]} */ ([]))
  const [activeLensId, setActiveLensId] = useState(null)
  const [lensBusy, setLensBusy] = useState(false)

  const sessionRef = useRef(null)
  const cameraKitRef = useRef(null)
  const streamRef = useRef(null)
  const cancelledRef = useRef(false)

  const setCanvasRef = useCallback((el) => {
    setCanvasNode(el)
  }, [])

  useEffect(() => {
    cancelledRef.current = false
    if (!enabled || !canvasNode) {
      return undefined
    }

    const token = getSnapApiToken()
    if (!token) {
      queueMicrotask(() => {
        setError('Missing VITE_SNAP_CAMERA_KIT_API_TOKEN')
        onInitFailed?.(new Error('no token'))
      })
      return undefined
    }

    let session = null

    async function init() {
      await Promise.resolve()
      setError(null)
      setReady(false)
      try {
        const {
          bootstrapCameraKit,
          createMediaStreamSource,
          Transform2D,
        } = await import('@snap/camera-kit')

        const cameraKit = await bootstrapCameraKit({
          apiToken: token,
        })
        if (cancelledRef.current) return
        cameraKitRef.current = cameraKit

        session = await cameraKit.createSession({
          liveRenderTarget: canvasNode,
        })
        sessionRef.current = session

        session.events.addEventListener('error', ({ detail }) => {
          console.error('[Camera Kit]', detail?.error)
        })

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
        if (cancelledRef.current) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream

        const source = createMediaStreamSource(stream, {
          transform: Transform2D.MirrorX,
          cameraType: 'front',
        })
        await session.setSource(source)

        const groupIds = getSnapLensGroupIds()
        let list = []
        if (groupIds.length > 0) {
          const result = await cameraKit.lensRepository.loadLensGroups(groupIds)
          list = dedupeLenses(result?.lenses ?? [])
        }
        if (cancelledRef.current) return

        setLenses(list)
        setActiveLensId(null)
        try {
          await session.removeLens()
        } catch {
          // ignore if already no lens
        }

        await session.play('live')
        await session.play('capture')

        if (!cancelledRef.current) {
          setReady(true)
        }
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        if (!cancelledRef.current) {
          setError(err.message)
          onInitFailed?.(err)
        }
        try {
          streamRef.current?.getTracks().forEach((t) => t.stop())
        } catch {
          // ignore
        }
        streamRef.current = null
        sessionRef.current = null
      }
    }

    void init()

    return () => {
      cancelledRef.current = true
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop())
      } catch {
        // ignore
      }
      streamRef.current = null
      sessionRef.current = null
      cameraKitRef.current = null
      queueMicrotask(() => {
        setReady(false)
        setError(null)
        setLenses([])
        setActiveLensId(null)
        setLensBusy(false)
      })
    }
  }, [enabled, canvasNode, onInitFailed])

  const applyLens = useCallback(async (lens) => {
    const sess = sessionRef.current
    if (!sess || !lens) return
    setLensBusy(true)
    try {
      await sess.applyLens(lens)
      setActiveLensId(lens.id)
    } catch (e) {
      console.error(e)
    } finally {
      setLensBusy(false)
    }
  }, [])

  const clearLens = useCallback(async () => {
    const sess = sessionRef.current
    if (!sess) return
    setLensBusy(true)
    try {
      await sess.removeLens()
      setActiveLensId(null)
    } catch (e) {
      console.error(e)
    } finally {
      setLensBusy(false)
    }
  }, [])

  /** Snapshot current frame from the `capture` canvas (best for saving/sharing). */
  const captureFrame = useCallback((quality = 0.92) => {
    const sess = sessionRef.current
    if (!sess?.output?.capture) return null
    try {
      return sess.output.capture.toDataURL('image/jpeg', quality)
    } catch {
      return null
    }
  }, [])

  return {
    setCanvasRef,
    ready,
    error,
    lenses,
    activeLensId,
    lensBusy,
    applyLens,
    clearLens,
    captureFrame,
  }
}
