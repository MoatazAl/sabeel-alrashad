"use client";

import Image from "next/image";
import {
  ChevronDown,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { groupLessons } from "@/lib/library";
import type { Book, Lesson } from "@/lib/types";

type RecordingCoursePlayerProps = {
  book: Book;
  initialLessonId?: string;
};

const playbackRates = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";

  const totalSeconds = Math.floor(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getLessonNumber(lesson: Lesson, index: number) {
  return lesson.number ?? index + 1;
}

export function RecordingCoursePlayer({
  book,
  initialLessonId,
}: RecordingCoursePlayerProps) {
  const lessons = useMemo(
    () => book.lessons.filter((lesson) => Boolean(lesson.audioUrl)),
    [book.lessons]
  );
  const firstLesson =
    lessons.find((lesson) => lesson.id === initialLessonId) ?? lessons[0];

  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<HTMLElement>(null);
  const pendingSeekRef = useRef<number | null>(null);
  const shouldPlayAfterLoadRef = useRef(false);
  const sourceGenerationRef = useRef(0);
  const controlsHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsInteractionActiveRef = useRef(false);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | undefined>(
    firstLesson
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [arePlayerControlsVisible, setArePlayerControlsVisible] = useState(true);
  const [showsMainCourseCover, setShowsMainCourseCover] = useState(
    book.slug === "sahih-al-bukhari" && !initialLessonId
  );

  const usesSectionedLessonIndex = book.slug === "sahih-al-bukhari";
  const groupedLessons = useMemo(
    () => groupLessons(lessons),
    [lessons]
  );

  const selectedIndex = selectedLesson
    ? lessons.findIndex((lesson) => lesson.id === selectedLesson.id)
    : -1;
  const nextLesson =
    selectedIndex >= 0 && selectedIndex < lessons.length - 1
      ? lessons[selectedIndex + 1]
      : undefined;
  const selectedSectionLessons = selectedLesson
    ? groupedLessons[selectedLesson.section || "الدروس"] ?? []
    : [];
  const selectedLessonNumber = selectedLesson
    ? usesSectionedLessonIndex
      ? selectedSectionLessons.findIndex(
          (lesson) => lesson.id === selectedLesson.id
        ) + 1
      : getLessonNumber(selectedLesson, selectedIndex)
    : 0;
  const selectedLessonTotal = usesSectionedLessonIndex
    ? selectedSectionLessons.length
    : lessons.length;
  const selectedLessonTitle = usesSectionedLessonIndex
    ? `الدرس ${selectedLessonNumber}`
    : selectedLesson?.title;
  const coverImage = showsMainCourseCover
    ? book.coverImage ?? book.cover ?? ""
    : selectedLesson?.coverImage ??
      selectedLesson?.image ??
      book.coverImage ??
      book.cover ??
      "";
  const sliderMax = Math.max(duration, currentTime, 1);
  const progressPercent = Math.min(
    100,
    Math.max(0, (Math.min(currentTime, sliderMax) / sliderMax) * 100)
  );
  const progressStyle = {
    "--range-progress": `${progressPercent}%`,
  } as CSSProperties;
  const volumeStyle = {
    "--range-progress": `${(isMuted ? 0 : volume) * 100}%`,
  } as CSSProperties;

  const clearControlsHideTimer = useCallback(() => {
    if (controlsHideTimerRef.current === null) return;

    clearTimeout(controlsHideTimerRef.current);
    controlsHideTimerRef.current = null;
  }, []);

  const scheduleControlsHide = useCallback(() => {
    clearControlsHideTimer();
    const activeElement = document.activeElement;
    const hasFocusedControl =
      activeElement instanceof HTMLElement &&
      playerRef.current?.contains(activeElement) &&
      (activeElement.matches("input, select") ||
        activeElement.matches(":focus-visible"));

    if (
      audioRef.current?.paused !== false ||
      controlsInteractionActiveRef.current ||
      hasFocusedControl
    ) {
      return;
    }

    controlsHideTimerRef.current = setTimeout(() => {
      const currentActiveElement = document.activeElement;
      const stillHasFocusedControl =
        currentActiveElement instanceof HTMLElement &&
        playerRef.current?.contains(currentActiveElement) &&
        (currentActiveElement.matches("input, select") ||
          currentActiveElement.matches(":focus-visible"));

      if (
        audioRef.current?.paused !== false ||
        controlsInteractionActiveRef.current ||
        stillHasFocusedControl
      ) {
        controlsHideTimerRef.current = null;
        return;
      }

      setArePlayerControlsVisible(false);
      controlsHideTimerRef.current = null;
    }, 2200);
  }, [clearControlsHideTimer]);

  const revealControlsTemporarily = useCallback(() => {
    setArePlayerControlsVisible(true);
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  const keepControlsVisible = useCallback(() => {
    clearControlsHideTimer();
    setArePlayerControlsVisible(true);
  }, [clearControlsHideTimer]);

  const beginControlsInteraction = useCallback(() => {
    controlsInteractionActiveRef.current = true;
    keepControlsVisible();
  }, [keepControlsVisible]);

  const endControlsInteraction = useCallback(() => {
    controlsInteractionActiveRef.current = false;
    setTimeout(scheduleControlsHide, 0);
  }, [scheduleControlsHide]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    function handleDocumentFocusIn(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (player?.contains(target)) {
        keepControlsVisible();
        return;
      }

      controlsInteractionActiveRef.current = false;
      setTimeout(scheduleControlsHide, 0);
    }

    document.addEventListener("focusin", handleDocumentFocusIn);

    return () => {
      document.removeEventListener("focusin", handleDocumentFocusIn);
    };
  }, [keepControlsVisible, scheduleControlsHide]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      sourceGenerationRef.current += 1;
      audio?.pause();
      clearControlsHideTimer();
    };
  }, [clearControlsHideTimer]);

  const playAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    const sourceGeneration = sourceGenerationRef.current;

    try {
      setErrorMessage("");
      await audio.play();
      if (sourceGeneration !== sourceGenerationRef.current) return;
      setIsPlaying(true);
      setArePlayerControlsVisible(true);
      scheduleControlsHide();
    } catch (error) {
      const wasSuperseded = sourceGeneration !== sourceGenerationRef.current;
      const wasAborted = error instanceof DOMException && error.name === "AbortError";
      if (wasSuperseded || wasAborted) return;

      setIsPlaying(false);
      keepControlsVisible();
      setErrorMessage("تعذر تشغيل التسجيل، يرجى المحاولة لاحقًا");

      if (process.env.NODE_ENV !== "production") {
        console.warn("Audio play() failed", {
          url: audio.currentSrc || audio.src,
          error,
        });
      }
    }
  }, [keepControlsVisible, scheduleControlsHide]);

  function loadPlayableSource(
    source: string,
    startTime: number,
    shouldPlay: boolean
  ) {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    sourceGenerationRef.current += 1;
    pendingSeekRef.current = Math.max(0, startTime);
    shouldPlayAfterLoadRef.current = shouldPlay;
    audio.src = source;
    audio.load();
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const media = audio;

    function applyPendingSeek() {
      const pendingSeek = pendingSeekRef.current;
      if (pendingSeek === null || !Number.isFinite(pendingSeek)) return;

      media.currentTime = Math.max(0, pendingSeek);
      pendingSeekRef.current = null;
      setCurrentTime(media.currentTime);
    }

    function handleMetadata() {
      setDuration(Number.isFinite(media.duration) ? media.duration : 0);
      media.playbackRate = playbackRate;
      applyPendingSeek();

      if (shouldPlayAfterLoadRef.current) {
        shouldPlayAfterLoadRef.current = false;
        void playAudio();
      }
    }

    function handleTimeUpdate() {
      setCurrentTime(media.currentTime);
    }

    function handleEnded() {
      setIsPlaying(false);
      keepControlsVisible();
      setCurrentTime(Number.isFinite(media.duration) ? media.duration : media.currentTime);
    }

    function handleError() {
      setIsPlaying(false);
      keepControlsVisible();
      setErrorMessage("تعذر تشغيل التسجيل، يرجى المحاولة لاحقًا");

      if (process.env.NODE_ENV !== "production") {
        console.warn("Audio playback failed", {
          url: media.currentSrc || media.src,
          code: media.error?.code,
          message: media.error?.message,
        });
      }
    }

    media.addEventListener("loadedmetadata", handleMetadata);
    media.addEventListener("durationchange", handleMetadata);
    media.addEventListener("timeupdate", handleTimeUpdate);
    media.addEventListener("ended", handleEnded);
    media.addEventListener("error", handleError);

    return () => {
      media.removeEventListener("loadedmetadata", handleMetadata);
      media.removeEventListener("durationchange", handleMetadata);
      media.removeEventListener("timeupdate", handleTimeUpdate);
      media.removeEventListener("ended", handleEnded);
      media.removeEventListener("error", handleError);
    };
  }, [keepControlsVisible, playAudio, playbackRate]);

  function updateUrl(lesson: Lesson) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("lesson", lesson.id);
    window.history.replaceState(null, "", nextUrl.toString());
  }

  function selectLesson(lesson: Lesson, shouldPlay = true) {
    if (!lesson.audioUrl) return;

    shouldPlayAfterLoadRef.current = shouldPlay;
    setErrorMessage("");
    setIsPlaying(false);
    keepControlsVisible();
    setCurrentTime(0);
    setDuration(0);
    setSelectedLesson(lesson);
    setShowsMainCourseCover(false);
    if (usesSectionedLessonIndex) {
      setOpenSection(lesson.section || "الدروس");
    }
    updateUrl(lesson);
    loadPlayableSource(lesson.audioUrl, lesson.startAt ?? 0, shouldPlay);
  }

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || !selectedLesson?.audioUrl) return;

    setShowsMainCourseCover(false);

    if (isPlaying) {
      audio.pause();
      sourceGenerationRef.current += 1;
      setIsPlaying(false);
      keepControlsVisible();
      return;
    }

    if (!audio.currentSrc || audio.error) {
      loadPlayableSource(
        selectedLesson.audioUrl,
        selectedLesson.startAt ?? 0,
        true
      );
      return;
    }

    void playAudio();
  }

  function seekTo(targetTime: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(targetTime)) return;

    const clampedTime =
      duration > 0
        ? Math.min(Math.max(0, targetTime), duration)
        : Math.max(0, targetTime);

    audio.currentTime = clampedTime;
    setCurrentTime(clampedTime);
  }

  function handleSeek(value: string) {
    seekTo(Number(value));
  }

  function skipBackward() {
    seekTo(currentTime - 10);
  }

  function skipForward() {
    seekTo(currentTime + 10);
  }

  function toggleMute() {
    const audio = audioRef.current;
    const nextMuted = !isMuted;

    if (audio) audio.muted = nextMuted;
    setIsMuted(nextMuted);
  }

  function handleVolumeChange(value: string) {
    const audio = audioRef.current;
    const nextVolume = Math.min(1, Math.max(0, Number(value)));
    if (!Number.isFinite(nextVolume)) return;

    const nextMuted = nextVolume === 0;

    if (audio) {
      audio.volume = nextVolume;
      audio.muted = nextMuted;
    }

    setVolume(nextVolume);
    setIsMuted(nextMuted);
  }

  function handlePlaybackRateChange(value: string) {
    const nextRate = Number(value);
    if (!Number.isFinite(nextRate)) return;

    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }

    setPlaybackRate(nextRate);
  }

  async function toggleFullscreen() {
    const canUseFullscreen =
      document.fullscreenEnabled && Boolean(playerRef.current?.requestFullscreen);

    if (!canUseFullscreen || !playerRef.current) {
      setErrorMessage("ملء الشاشة غير مدعوم في هذا المتصفح");
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await playerRef.current.requestFullscreen();
      }
    } catch (error) {
      setErrorMessage("تعذر فتح ملء الشاشة");

      if (process.env.NODE_ENV !== "production") {
        console.error("Fullscreen toggle failed", error);
      }
    }
  }

  if (!selectedLesson) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600 shadow-sm">
        لا توجد تسجيلات صوتية لهذه السلسلة.
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-5">
      <div
        className={[
          "grid gap-5",
          usesSectionedLessonIndex
            ? "xl:grid-cols-[minmax(0,1fr)_360px]"
            : "xl:grid-cols-[minmax(0,1fr)_320px]",
        ].join(" ")}
      >
        <section className="min-w-0 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-bold text-amber-700">تسجيل صوتي</p>
            <h1 className="text-3xl font-bold leading-tight text-stone-950">
              {book.title}
            </h1>
            <p className="text-lg font-semibold leading-8 text-emerald-950">
              {selectedLessonTitle}
            </p>
          </div>

          <article
            ref={playerRef}
            onPointerMove={revealControlsTemporarily}
            onPointerDown={revealControlsTemporarily}
            onTouchStart={revealControlsTemporarily}
            onKeyDownCapture={keepControlsVisible}
            onFocusCapture={keepControlsVisible}
            onBlurCapture={(event) => {
              if (
                !event.currentTarget.contains(
                  event.relatedTarget as Node | null
                )
              ) {
                endControlsInteraction();
              }
            }}
            className={[
              "relative overflow-hidden bg-stone-950 text-white shadow-[0_22px_70px_rgba(57,44,24,0.14)]",
              isFullscreen
                ? "h-screen w-screen rounded-none border-0 shadow-none"
                : "aspect-video min-h-[300px] rounded-lg border border-[#d8c59d] sm:min-h-[430px]",
            ].join(" ")}
          >
            {coverImage ? (
              <Image
                key={`${selectedLesson.id}-cover`}
                src={coverImage}
                alt={`غلاف ${book.title}`}
                fill
                priority
                sizes="(min-width: 1280px) 900px, (min-width: 1024px) calc(100vw - 380px), 100vw"
                className={
                  book.imageFit === "contain" ? "object-contain" : "object-cover"
                }
                style={{
                  objectPosition: book.imagePosition ?? "center",
                }}
              />
            ) : null}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/45" />

            <div
              data-player-top-overlay
              data-visible={arePlayerControlsVisible ? "true" : "false"}
              className={[
                "absolute inset-x-0 top-0 z-10 p-4 transition-opacity duration-300 sm:p-5",
                arePlayerControlsVisible
                  ? "opacity-100"
                  : "pointer-events-none opacity-0",
              ].join(" ")}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-amber-100">
                    الدرس {selectedLessonNumber} من {selectedLessonTotal}
                  </p>
                  <h2 className="mt-1 max-w-3xl text-xl font-bold leading-8 text-white sm:text-2xl">
                    {selectedLessonTitle}
                  </h2>
                </div>
                {selectedLesson.section ? (
                  <span className="rounded-full border border-white/25 bg-black/35 px-3 py-1 text-sm font-bold text-white backdrop-blur">
                    {selectedLesson.section}
                  </span>
                ) : null}
              </div>
            </div>

            <div
              data-center-controls
              data-visible={arePlayerControlsVisible ? "true" : "false"}
              className={[
                "absolute inset-0 z-10 flex items-center justify-center px-4 transition-opacity duration-300",
                arePlayerControlsVisible
                  ? "opacity-100"
                  : "pointer-events-none opacity-0",
              ].join(" ")}
            >
              <div className="grid grid-cols-[auto_auto_auto] items-center gap-3 sm:gap-5">
                <button
                  type="button"
                  onClick={skipForward}
                  aria-label="تقديم 10 ثوانٍ"
                  className="inline-flex h-12 min-w-14 items-center justify-center gap-1 rounded-full border border-white/25 bg-black/45 px-3 text-sm font-bold text-white shadow-lg backdrop-blur transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-amber-200 sm:h-14 sm:min-w-16"
                >
                  <span>10</span>
                  <RotateCw className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={togglePlayback}
                  aria-label={isPlaying ? "إيقاف" : "تشغيل"}
                  className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white shadow-2xl shadow-black/40 backdrop-blur transition hover:scale-105 hover:bg-emerald-950/80 focus:outline-none focus:ring-2 focus:ring-amber-200 sm:h-24 sm:w-24"
                >
                  {isPlaying ? (
                    <Pause className="h-9 w-9" aria-hidden="true" fill="currentColor" />
                  ) : (
                    <Play className="h-9 w-9" aria-hidden="true" fill="currentColor" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={skipBackward}
                  aria-label="رجوع 10 ثوانٍ"
                  className="inline-flex h-12 min-w-14 items-center justify-center gap-1 rounded-full border border-white/25 bg-black/45 px-3 text-sm font-bold text-white shadow-lg backdrop-blur transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-amber-200 sm:h-14 sm:min-w-16"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>10</span>
                </button>
              </div>
            </div>

            <div
              data-player-bottom-controls
              data-visible={arePlayerControlsVisible ? "true" : "false"}
              className={[
                "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 pt-10 transition-opacity duration-300 sm:p-5 sm:pt-14",
                arePlayerControlsVisible
                  ? "opacity-100"
                  : "pointer-events-none opacity-0",
              ].join(" ")}
            >
              {errorMessage ? (
                <p className="mb-3 rounded-md border border-red-200/50 bg-red-950/80 px-4 py-3 text-sm font-bold text-red-50 backdrop-blur">
                  {errorMessage}
                </p>
              ) : null}

              <input
                type="range"
                min="0"
                max={sliderMax}
                step="1"
                value={Math.min(currentTime, sliderMax)}
                onChange={(event) => handleSeek(event.target.value)}
                onPointerDown={beginControlsInteraction}
                onPointerUp={endControlsInteraction}
                onPointerCancel={endControlsInteraction}
                aria-label={`تقدم تشغيل ${selectedLessonTitle}`}
                style={progressStyle}
                className="audio-range h-2 w-full cursor-pointer accent-amber-300"
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div
                  dir="ltr"
                  className="text-sm font-semibold tabular-nums text-white/85"
                >
                  {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : "--:--"}
                </div>

                <div dir="ltr" className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Volume2 className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(event) => handleVolumeChange(event.target.value)}
                    onPointerDown={beginControlsInteraction}
                    onPointerUp={endControlsInteraction}
                    onPointerCancel={endControlsInteraction}
                    aria-label="مستوى الصوت"
                    style={volumeStyle}
                    className="audio-range h-1 w-20 cursor-pointer accent-amber-300 sm:w-28"
                  />
                  <select
                    value={String(playbackRate)}
                    onChange={(event) =>
                      handlePlaybackRateChange(event.target.value)
                    }
                    onFocus={keepControlsVisible}
                    onBlur={endControlsInteraction}
                    aria-label="سرعة التشغيل"
                    className="h-10 rounded-md border border-white/20 bg-black/35 px-2 text-sm font-bold text-white outline-none transition hover:bg-black/55 focus:ring-2 focus:ring-amber-200"
                  >
                    {playbackRates.map((rate) => (
                      <option key={rate} value={String(rate)}>
                        {rate}x
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Maximize2 className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </article>

          <div className="rounded-lg border border-[#e0d2b4] bg-[#fffdf7] p-4 shadow-[0_12px_35px_rgba(57,44,24,0.08)]">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div>
                <p className="text-sm font-bold text-amber-700">الدرس التالي</p>
                <p className="mt-1 text-base leading-7 text-stone-700">
                  {nextLesson
                    ? usesSectionedLessonIndex
                      ? `الدرس ${
                          (groupedLessons[nextLesson.section || "الدروس"] ?? []).findIndex(
                            (lesson) => lesson.id === nextLesson.id
                          ) + 1
                        }`
                      : nextLesson.title
                    : "وصلت إلى آخر درس في هذه السلسلة."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => nextLesson && selectLesson(nextLesson)}
                disabled={!nextLesson}
                className="rounded-md bg-emerald-900 px-6 py-3 text-base font-bold text-white shadow-[0_10px_24px_rgba(6,78,59,0.22)] transition hover:bg-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
              >
                {nextLesson ? "تشغيل الدرس التالي" : "آخر درس"}
              </button>
            </div>
          </div>
        </section>

        <aside
          className={[
            "min-w-0 rounded-lg border border-[#dfd1b4] bg-[#fffdf7] p-3 shadow-[0_14px_45px_rgba(57,44,24,0.08)] xl:sticky xl:top-28",
            usesSectionedLessonIndex ? "xl:max-h-[720px]" : "xl:max-h-[560px]",
          ].join(" ")}
        >
          {usesSectionedLessonIndex ? (
            <>
              <div className="mb-3 border-b border-[#eadfc8] pb-3">
                <h2 className="text-xl font-bold leading-8 text-stone-950">
                  قائمة الدروس
                </h2>
                <p className="mt-1 text-sm leading-6 text-stone-500">
                  اختر كتاباً لعرض دروسه، أو انتقل بالتتابع من الأزرار.
                </p>
              </div>

              <div className="lesson-scroll max-h-[560px] space-y-3 overflow-y-auto pl-1 pr-0.5 xl:max-h-[600px]">
                {Object.entries(groupedLessons).map(
                  ([section, sectionLessons], sectionIndex) => {
                    const isOpen = openSection === section;
                    const containsSelectedLesson = sectionLessons.some(
                      (lesson) => lesson.id === selectedLesson.id
                    );
                    const panelId = `recording-section-${sectionIndex}`;

                    return (
                      <section
                        key={section}
                        className={[
                          "overflow-hidden rounded-xl border bg-white transition",
                          isOpen
                            ? "border-emerald-800/25 shadow-sm"
                            : "border-stone-200/80",
                        ].join(" ")}
                      >
                        <h3>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenSection((current) =>
                                current === section ? null : section
                              )
                            }
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            className={[
                              "flex w-full items-center justify-between gap-4 p-4 text-start font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-800",
                              isOpen
                                ? "bg-emerald-50 text-emerald-950"
                                : containsSelectedLesson
                                  ? "bg-stone-50 text-stone-950"
                                  : "text-stone-800 hover:bg-stone-50",
                            ].join(" ")}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <ChevronDown
                                className={[
                                  "h-5 w-5 shrink-0 transition-transform",
                                  isOpen ? "rotate-180" : "",
                                ].join(" ")}
                                aria-hidden="true"
                              />
                              <span className="leading-7">{section}</span>
                            </span>
                            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                              {sectionLessons.length}{" "}
                              {sectionLessons.length === 1 ? "درس" : "دروس"}
                            </span>
                          </button>
                        </h3>

                        {isOpen ? (
                          <div
                            id={panelId}
                            className="space-y-2 border-t border-stone-100 p-2"
                          >
                            {sectionLessons.map((lesson, sectionLessonIndex) => {
                              const isActive = lesson.id === selectedLesson.id;
                              const isActivePlaying = isActive && isPlaying;

                              return (
                                <button
                                  key={lesson.id}
                                  type="button"
                                  onClick={() => selectLesson(lesson)}
                                  aria-current={isActive ? "true" : undefined}
                                  className={[
                                    "relative flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-right transition focus:outline-none focus:ring-2 focus:ring-emerald-800",
                                    isActive
                                      ? "border-emerald-800/35 bg-emerald-50 text-emerald-950 shadow-sm"
                                      : "border-stone-200/70 bg-white text-stone-700 hover:border-emerald-800/20 hover:bg-stone-50",
                                  ].join(" ")}
                                >
                                  <span
                                    className={[
                                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                                      isActive
                                        ? "border-emerald-900 bg-emerald-900 text-amber-50"
                                        : "border-[#e7dac0] bg-[#fbf7ee] text-stone-600",
                                    ].join(" ")}
                                  >
                                    {sectionLessonIndex + 1}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-base font-bold leading-7">
                                      الدرس {sectionLessonIndex + 1}
                                    </span>
                                    {isActivePlaying || lesson.duration ? (
                                      <span className="mt-0.5 block text-sm font-semibold text-stone-500">
                                        {isActivePlaying
                                          ? "قيد التشغيل"
                                          : lesson.duration}
                                      </span>
                                    ) : null}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </section>
                    );
                  }
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mb-3 border-b border-[#eadfc8] pb-3">
                <p className="text-sm font-bold text-amber-700">فهرس التسجيلات</p>
                <h2 className="mt-1 text-xl font-bold leading-8 text-stone-950">
                  الدروس
                </h2>
              </div>

              <div className="lesson-scroll max-h-[360px] space-y-2 overflow-y-auto pl-1 pr-0.5 xl:max-h-[450px]">
                {lessons.map((lesson, index) => {
                  const isActive = lesson.id === selectedLesson.id;
                  const isActivePlaying = isActive && isPlaying;

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => selectLesson(lesson)}
                      aria-current={isActive ? "true" : undefined}
                      className={[
                        "relative flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-right transition focus:outline-none focus:ring-2 focus:ring-emerald-800",
                        isActive
                          ? "border-emerald-800/45 bg-emerald-50 text-emerald-950 shadow-sm"
                          : "border-[#eee5d4] bg-white text-stone-700 hover:border-[#d8c59d] hover:bg-[#fffaf0]",
                      ].join(" ")}
                    >
                      {isActive ? (
                        <span className="absolute right-0 top-3 h-7 w-1 rounded-l-full bg-amber-500" />
                      ) : null}
                      <span
                        className={[
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                          isActive
                            ? "border-emerald-900 bg-emerald-900 text-amber-50"
                            : "border-[#e7dac0] bg-[#fbf7ee] text-stone-600",
                        ].join(" ")}
                      >
                        {getLessonNumber(lesson, index)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-bold leading-7">
                          {lesson.title}
                        </span>
                        <span className="mt-0.5 block text-sm font-semibold text-stone-600">
                          {isActivePlaying
                            ? "قيد التشغيل"
                            : lesson.duration ?? lesson.section ?? "تسجيل صوتي"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </aside>
      </div>

      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}
