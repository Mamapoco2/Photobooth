import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { Moon, SunMedium, ChevronLeft, ExternalLink } from "lucide-react";
import { Camera } from "@/components/Camera";
import { SnapCameraPreview } from "@/components/SnapCameraPreview";
import { SnapLensStrip } from "@/components/SnapLensStrip";
import { Timer } from "@/components/Timer";
import { PhotoPreview } from "@/components/PhotoPreview";
import { TemplateSelector } from "@/components/TemplateSelector";
import { EditorCanvas } from "@/components/EditorCanvas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  CAPTURE_INTERVAL_MS,
  DEFAULT_COUNTDOWN_SEC,
  DEFAULT_STRIP_LAYOUT,
  PHOTO_COUNT,
  STRIP_LAYOUT_1X4,
  STRIP_LAYOUT_2X2,
} from "@/lib/constants";
import { FILTER_PRESETS, getFilterCss } from "@/lib/filters";
import { playShutterSound } from "@/lib/sound";
import { useCamera } from "@/hooks/useCamera";
import { useSnapCameraKit } from "@/hooks/useSnapCameraKit";
import { useThemeMode } from "@/hooks/useThemeMode";
import { isSnapConfigured } from "@/lib/snapEnv";

const SESSION_KEY = "photobooth-session-v1";

const emptyPans = () =>
  Array.from({ length: PHOTO_COUNT }, () => ({ x: 0, y: 0 }));

function IgIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function loadSavedSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (
      !Array.isArray(data.photos) ||
      data.photos.length !== PHOTO_COUNT ||
      !data.photos.every(
        (p) => typeof p === "string" && p.startsWith("data:image/")
      ) ||
      typeof data.templateId !== "string"
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function PhotoboothApp() {
  const year = new Date().getFullYear();

  const { videoRef, start, captureFrame, error, ready } = useCamera({
    mirror: true,
  });

  const [snapInitFailed, setSnapInitFailed] = useState(false);
  const wantSnap = isSnapConfigured() && !snapInitFailed;

  const handleSnapInitFailed = useCallback(() => {
    setSnapInitFailed(true);
  }, []);

  const snap = useSnapCameraKit({
    enabled: wantSnap,
    onInitFailed: handleSnapInitFailed,
  });

  const snapActive = wantSnap && snap.ready && !snap.error;
  const shouldUseClassic = !wantSnap || snapInitFailed || Boolean(snap.error);
  const snapCaptureFrame = snap.captureFrame;

  useEffect(() => {
    if (shouldUseClassic) void start();
  }, [shouldUseClassic, start]);

  const [phase, setPhase] = useState(
    /** @type {'idle' | 'countdown' | 'capturing' | 'review' | 'design'} */ (
      "idle"
    )
  );
  const [countdownSec, setCountdownSec] = useState(DEFAULT_COUNTDOWN_SEC);
  const [countDisplay, setCountDisplay] = useState(DEFAULT_COUNTDOWN_SEC);
  const [photos, setPhotos] = useState(/** @type {string[]} */ ([]));
  const [templateId, setTemplateId] = useState("modern");
  const [pans, setPans] = useState(emptyPans);
  const [caption, setCaption] = useState("Memories");
  const [showDate, setShowDate] = useState(true);
  const [filterId, setFilterId] = useState("none");
  /** Live camera + baked into JPEG captures */
  const [cameraFilterId, setCameraFilterId] = useState("none");
  /** Final strip arrangement */
  const [stripLayout, setStripLayout] = useState(DEFAULT_STRIP_LAYOUT);
  const [flash, setFlash] = useState(false);
  const hydrated = useRef(false);

  const { dark, toggle: toggleTheme } = useThemeMode();

  useEffect(() => {
    if (hydrated.current) return;
    const s = loadSavedSession();
    hydrated.current = true;
    if (!s) return;
    queueMicrotask(() => {
      setPhotos(s.photos);
      setTemplateId(s.templateId);
      setCaption(typeof s.caption === "string" ? s.caption : "Memories");
      setShowDate(s.showDate !== false);
      setFilterId(typeof s.filterId === "string" ? s.filterId : "none");
      setCameraFilterId(
        typeof s.cameraFilterId === "string" ? s.cameraFilterId : "none"
      );
      if (
        s.stripLayout === STRIP_LAYOUT_2X2 ||
        s.stripLayout === STRIP_LAYOUT_1X4
      )
        setStripLayout(s.stripLayout);
      if (Array.isArray(s.pans) && s.pans.length === PHOTO_COUNT)
        setPans(s.pans);
      if (typeof s.countdownSec === "number")
        setCountdownSec(Math.min(10, Math.max(1, s.countdownSec)));
      setPhase("review");
    });
  }, []);

  useEffect(() => {
    if (!photos.length) return;
    const t = window.setTimeout(() => {
      try {
        const payload = JSON.stringify({
          photos,
          templateId,
          caption,
          showDate,
          filterId,
          cameraFilterId,
          stripLayout,
          pans,
          countdownSec,
        });
        if (payload.length > 6_000_000) return;
        localStorage.setItem(SESSION_KEY, payload);
      } catch {
        // quota / private mode
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [
    photos,
    templateId,
    caption,
    showDate,
    filterId,
    cameraFilterId,
    stripLayout,
    pans,
    countdownSec,
  ]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countDisplay <= 0) {
      queueMicrotask(() => setPhase("capturing"));
      return;
    }
    const id = window.setTimeout(() => setCountDisplay((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, countDisplay]);

  useEffect(() => {
    if (phase !== "capturing") return;
    let cancelled = false;
    const pending = [];

    function delay(ms) {
      return new Promise((resolve) => {
        pending.push(window.setTimeout(resolve, ms));
      });
    }

    async function run() {
      setPhotos([]);
      await delay(450);
      for (let shot = 0; shot < PHOTO_COUNT; shot++) {
        if (cancelled) return;
        if (shot > 0) await delay(CAPTURE_INTERVAL_MS);
        if (cancelled) return;
        setFlash(true);
        pending.push(window.setTimeout(() => setFlash(false), 140));
        playShutterSound();
        const frame = snapActive
          ? snapCaptureFrame(0.92)
          : captureFrame(0.92, getFilterCss(cameraFilterId));
        setPhotos((prev) => {
          const base =
            prev.length === 0
              ? Array.from({ length: PHOTO_COUNT }, () => "")
              : [...prev];
          if (frame) {
            base[shot] = frame;
          }
          return base;
        });
      }
      if (!cancelled) setPhase("review");
    }

    void run();
    return () => {
      cancelled = true;
      pending.forEach((id) => window.clearTimeout(id));
    };
  }, [phase, captureFrame, cameraFilterId, snapActive, snapCaptureFrame]);

  const handleStart = useCallback(() => {
    setPhotos([]);
    setPans(emptyPans());
    setCountDisplay(countdownSec);
    setPhase("countdown");
  }, [countdownSec]);

  const handleRetake = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    setPhotos([]);
    setPans(emptyPans());
    setPhase("idle");
  }, []);

  const handleProceedDesign = useCallback(() => {
    setPhase("design");
  }, []);

  const handleBackFromDesign = useCallback(() => {
    setPhase("review");
  }, []);

  return (
    <div className="relative min-h-dvh overflow-hidden pb-texture">
      <header className="relative z-10 border-b border-[rgb(var(--border))]/80 bg-[rgb(var(--background))]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <span className="font-display text-xl font-semibold tracking-[0.02em] text-[rgb(var(--foreground))] sm:text-2xl">
            photobooth
          </span>
          <div className="flex items-center gap-3 sm:gap-5">
            <a
              href="https://www.instagram.com/_mamapoco2/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-[rgb(var(--muted))] transition-colors hover:text-[rgb(var(--foreground))] sm:inline-flex"
            >
              <IgIcon className="size-4 shrink-0" />
              Follow
              <ExternalLink
                className="size-3 shrink-0 opacity-60"
                aria-hidden
              />
            </a>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full text-[rgb(var(--muted))] hover:bg-[rgb(var(--card))] hover:text-[rgb(var(--foreground))]"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              onClick={toggleTheme}
            >
              {dark ? (
                <SunMedium className="size-5" aria-hidden />
              ) : (
                <Moon className="size-5" aria-hidden />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-[1] mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-8 lg:pb-24">
        {phase === "idle" || phase === "countdown" || phase === "capturing" ? (
          <div className="flex flex-col items-center">
            {phase === "idle" ? (
              <Motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="mb-10 max-w-xl text-center sm:mb-14"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.42em] text-[rgb(var(--muted))]">
                  Est. {year}
                </p>
                <h1 className="font-display mt-5 text-[clamp(3rem,11vw,4.75rem)] font-semibold leading-[1.02] tracking-tight text-[rgb(var(--foreground))]">
                  photobooth
                </h1>
                <p className="font-display mx-auto mt-6 max-w-md text-xl font-normal italic leading-relaxed text-[rgb(var(--muted))] sm:text-[1.65rem] sm:leading-snug">
                  Capture the moment, cherish the magic, relive the love
                </p>
                <a
                  href="https://www.instagram.com/_mamapoco2/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 text-sm text-[rgb(var(--muted))] underline-offset-4 transition-colors hover:text-[rgb(var(--foreground))]"
                >
                  <IgIcon className="size-4" />
                  Follow me on Instagram @_mamapoco2
                </a>
              </Motion.section>
            ) : null}

            {phase === "capturing" ? (
              <div className="mb-8 text-center">
                <h2 className="font-display text-3xl font-semibold text-[rgb(var(--foreground))] sm:text-4xl">
                  Smile
                </h2>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                  Four quick shots — hold still and have fun
                </p>
              </div>
            ) : null}

            <div className="w-full max-w-xl space-y-10">
              {wantSnap && !snapInitFailed ? (
                <SnapCameraPreview
                  setCanvasRef={snap.setCanvasRef}
                  ready={snap.ready}
                  error={snap.error}
                />
              ) : (
                <Camera
                  videoRef={videoRef}
                  error={error}
                  ready={ready}
                  variant="editorial"
                  filterCss={getFilterCss(cameraFilterId)}
                />
              )}

              {phase === "idle" ? (
                <>
                  <Card className="border-[rgb(var(--border))] bg-[rgb(var(--card))]/90 shadow-[var(--shadow-hero)] backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-xl font-semibold normal-case text-[rgb(var(--foreground))]">
                        Before you start
                      </CardTitle>
                      <CardDescription className="text-[rgb(var(--muted))]">
                        Set the countdown ({countdownSec}s), then tap{" "}
                        <span className="font-medium text-[rgb(var(--foreground))]">
                          START
                        </span>
                        . We capture four frames in a row — you can refine the
                        strip afterward.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--pb-surface))] px-4 py-5">
                        <span className="text-xs font-medium uppercase tracking-[0.12em] text-[rgb(var(--muted))]">
                          Strip layout
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={
                              stripLayout === STRIP_LAYOUT_1X4
                                ? "default"
                                : "secondary"
                            }
                            className="rounded-xl py-6 font-display text-lg font-semibold"
                            onClick={() => setStripLayout(STRIP_LAYOUT_1X4)}
                          >
                            1 × 4
                          </Button>
                          <Button
                            type="button"
                            variant={
                              stripLayout === STRIP_LAYOUT_2X2
                                ? "default"
                                : "secondary"
                            }
                            className="rounded-xl py-6 font-display text-lg font-semibold"
                            onClick={() => setStripLayout(STRIP_LAYOUT_2X2)}
                          >
                            2 × 2
                          </Button>
                        </div>
                        <p className="text-xs leading-relaxed text-[rgb(var(--muted))]">
                          Vertical strip or four-up grid for your finished
                          design.
                        </p>
                      </div>

                      {wantSnap && !snapInitFailed ? (
                        <div className="space-y-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--pb-surface))] px-4 py-5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-medium uppercase tracking-[0.12em] text-[rgb(var(--muted))]">
                              Snap Lenses
                            </span>
                            <span className="text-xs text-[rgb(var(--muted))]">
                              Camera Kit · live + captures
                            </span>
                          </div>
                          {!snap.ready && !snap.error ? (
                            <p className="text-xs text-[rgb(var(--muted))]">
                              Loading lens list…
                            </p>
                          ) : null}
                          {snap.lenses.length === 0 &&
                          snap.ready &&
                          !snap.error ? (
                            <p className="text-xs leading-relaxed text-[rgb(var(--muted))]">
                              Add{" "}
                              <code className="rounded bg-[rgb(var(--card))] px-1 py-0.5 text-[11px]">
                                VITE_SNAP_LENS_GROUP_IDS
                              </code>{" "}
                              in{" "}
                              <code className="rounded bg-[rgb(var(--card))] px-1 py-0.5 text-[11px]">
                                .env
                              </code>{" "}
                              (Lens Scheduler group UUIDs, comma-separated) to
                              show lenses here. Preview stays unfiltered until a
                              lens is applied.
                            </p>
                          ) : null}
                          {snap.lenses.length > 0 ? (
                            <SnapLensStrip
                              lenses={snap.lenses}
                              activeLensId={snap.activeLensId}
                              onSelectLens={(lens) => void snap.applyLens(lens)}
                              onClearLens={() => void snap.clearLens()}
                              disabled={!snap.ready || Boolean(snap.error)}
                              busy={snap.lensBusy}
                            />
                          ) : null}
                        </div>
                      ) : (
                        <div className="space-y-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--pb-surface))] px-4 py-5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium uppercase tracking-[0.12em] text-[rgb(var(--muted))]">
                              Camera look
                            </span>
                            <span className="text-xs text-[rgb(var(--muted))]">
                              Live on preview + saved shots
                            </span>
                          </div>
                          <div className="flex max-h-[9.5rem] flex-wrap gap-2 overflow-y-auto pr-1">
                            {Object.values(FILTER_PRESETS).map((f) => (
                              <Button
                                key={f.id}
                                type="button"
                                size="sm"
                                variant={
                                  cameraFilterId === f.id
                                    ? "default"
                                    : "secondary"
                                }
                                className="shrink-0 rounded-lg text-xs"
                                onClick={() => setCameraFilterId(f.id)}
                              >
                                {f.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--pb-surface))] px-4 py-5">
                        <div className="flex items-baseline justify-between gap-2 text-sm font-medium text-[rgb(var(--foreground))]">
                          <span className="uppercase tracking-[0.12em] text-[rgb(var(--muted))]">
                            Countdown
                          </span>
                          <span className="tabular-nums text-[rgb(var(--muted))]">
                            {countdownSec}s
                          </span>
                        </div>
                        <Slider
                          value={[countdownSec]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(v) =>
                            setCountdownSec(v[0] ?? DEFAULT_COUNTDOWN_SEC)
                          }
                        />
                        <p className="text-xs leading-relaxed text-[rgb(var(--muted))]">
                          Photos are taken every {CAPTURE_INTERVAL_MS / 1000}s
                          so you can shift poses between frames.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="start"
                        size="start"
                        className="mx-auto w-full max-w-sm"
                        disabled={
                          phase !== "idle" ||
                          (wantSnap &&
                            !snapInitFailed &&
                            !snap.ready &&
                            !snap.error)
                        }
                        onClick={handleStart}
                      >
                        START
                      </Button>
                    </CardContent>
                  </Card>
                </>
              ) : null}

              {phase === "capturing" ? (
                <p className="text-center text-xs uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
                  Session in progress…
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {phase === "review" ? (
          <div className="mx-auto max-w-md">
            <PhotoPreview
              photos={photos}
              stripLayout={stripLayout}
              onRetake={handleRetake}
              onProceed={handleProceedDesign}
            />
          </div>
        ) : null}

        {phase === "design" ? (
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="border-b border-[rgb(var(--border))] pb-8 text-center sm:text-left">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-[rgb(var(--foreground))]">
                    Customize your strip
                  </h2>
                  <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                    Pick a layout, drag to reframe, add a line of text, then
                    save or share.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2 rounded-full border-[rgb(var(--border))]"
                  onClick={handleBackFromDesign}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  Back
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]/80 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                  Strip arrangement
                </p>
                <p className="text-xs text-[rgb(var(--muted))]">
                  Change how the four photos are composed (no need to reshoot).
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    stripLayout === STRIP_LAYOUT_1X4 ? "default" : "secondary"
                  }
                  className="font-display"
                  onClick={() => setStripLayout(STRIP_LAYOUT_1X4)}
                >
                  1 × 4
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    stripLayout === STRIP_LAYOUT_2X2 ? "default" : "secondary"
                  }
                  className="font-display"
                  onClick={() => setStripLayout(STRIP_LAYOUT_2X2)}
                >
                  2 × 2
                </Button>
              </div>
            </div>
            <TemplateSelector value={templateId} onChange={setTemplateId} />
            <EditorCanvas
              photos={photos}
              templateId={templateId}
              filterId={filterId}
              onFilterIdChange={setFilterId}
              caption={caption}
              onCaptionChange={setCaption}
              showDate={showDate}
              onShowDateChange={setShowDate}
              pans={pans}
              onPansChange={setPans}
              stripLayout={stripLayout}
            />
          </Motion.div>
        ) : null}

        <AnimatePresence>
          {phase === "countdown" && (
            <Motion.div
              key="countdown-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 flex items-center justify-center bg-neutral-950/90 px-6 backdrop-blur-md dark:bg-black/92"
            >
              <Timer value={Math.max(countDisplay, 0)} label="Get ready" />
            </Motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {flash && (
            <Motion.div
              key="flash"
              initial={{ opacity: 0.95 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="pointer-events-none fixed inset-0 z-40 bg-[rgb(var(--background))]"
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
