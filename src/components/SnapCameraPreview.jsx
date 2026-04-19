import { cn } from '@/lib/utils'

/**
 * Live preview for Snap Camera Kit (canvas is the WebGL render target).
 */
export function SnapCameraPreview({
  setCanvasRef,
  ready,
  error,
  className,
}) {
  return (
    <div
      className={cn(
        'relative w-full max-w-3xl mx-auto overflow-hidden rounded-[1.75rem] border-[3px] border-[rgb(var(--border))] bg-black shadow-[var(--shadow-hero)] ring-1 ring-black/[0.04]',
        className,
      )}
    >
      <canvas
        ref={setCanvasRef}
        className="block aspect-video h-auto w-full bg-black"
      />
      {!ready && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-center text-sm text-white/90">
          <span className="font-medium">Starting Camera Kit…</span>
          <span className="max-w-xs text-xs text-white/70">
            Loading lenses and WebAssembly runtime (first visit may take a few
            seconds).
          </span>
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center text-sm text-amber-100">
          {error}
        </div>
      ) : null}
    </div>
  )
}
