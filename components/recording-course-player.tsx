"use client";

import Image from "next/image";
import {
  Check,
  ChevronDown,
  Copy,
  LoaderCircle,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Share2,
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
  playerOnly?: boolean;
  displayLessonNumber?: number;
  displayLessonTotal?: number;
};

const playbackRates = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

type ShareStatus = "idle" | "copied" | "error";

type IOSFullscreenVideoElement = HTMLVideoElement & {
  webkitSupportsFullscreen?: boolean;
  webkitDisplayingFullscreen?: boolean;
  webkitEnterFullscreen?: () => void;
  webkitEnterFullScreen?: () => void;
  webkitExitFullscreen?: () => void;
};

function isIPhoneBrowser() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPod/i.test(navigator.userAgent);
}

function getFullscreenVideoUrl(audioUrl?: string) {
  if (!audioUrl) return "";

  return audioUrl.replace(
    /\.(?:m4a|aac|mp3)(\?.*)?$/i,
    ".mp4$1"
  );
}

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

function copyWithSelectionFallback(value: string) {
  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.inset = "0";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);

  try {
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, value.length);
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textArea);
  }
}

export function RecordingCoursePlayer({
  book,
  initialLessonId,
  playerOnly = false,
  displayLessonNumber,
  displayLessonTotal,
}: RecordingCoursePlayerProps) {
  const lessons = useMemo(
    () => book.lessons.filter((lesson) => Boolean(lesson.audioUrl)),
    [book.lessons]
  );
  const firstLesson =
    lessons.find((lesson) => lesson.id === initialLessonId) ?? lessons[0];

  const mediaRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLElement>(null);
  const pendingSeekRef = useRef<number | null>(null);
  const wantsPlaybackRef = useRef(false);
  const sourceGenerationRef = useRef(0);
  const iosResumeAfterFullscreenRef = useRef(false);
  const iosPauseIntentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iosResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsInteractionActiveRef = useRef(false);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | undefined>(
    firstLesson
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFallbackFullscreen, setIsFallbackFullscreen] = useState(false);
  const [isIOSVideoFullscreen, setIsIOSVideoFullscreen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(
    () => firstLesson?.section || "الدروس"
  );
  const [arePlayerControlsVisible, setArePlayerControlsVisible] = useState(true);
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const [supportsNativeShare, setSupportsNativeShare] = useState(false);
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
  const selectedLessonNumber =
    displayLessonNumber ??
    (selectedLesson
      ? usesSectionedLessonIndex
        ? selectedSectionLessons.findIndex(
          (lesson) => lesson.id === selectedLesson.id
        ) + 1
        : getLessonNumber(selectedLesson, selectedIndex)
      : 0);
  const selectedLessonTotal =
    displayLessonTotal ??
    (usesSectionedLessonIndex
      ? selectedSectionLessons.length
      : lessons.length);
  const selectedLessonTitle = usesSectionedLessonIndex
    ? `الدرس ${selectedLessonNumber}`
    : selectedLesson?.title;
  const displayedDuration =
    duration > 0 ? formatTime(duration) : selectedLesson?.duration;
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
  const fullscreenVideoUrl = getFullscreenVideoUrl(
    selectedLesson?.audioUrl
  );
  const isPlayerFullscreen =
    isFullscreen || isFallbackFullscreen || isIOSVideoFullscreen;

  const clearErrorHideTimer = useCallback(() => {
    if (errorHideTimerRef.current === null) return;

    clearTimeout(errorHideTimerRef.current);
    errorHideTimerRef.current = null;
  }, []);

  const showErrorTemporarily = useCallback(
    (message: string) => {
      clearErrorHideTimer();
      setErrorMessage(message);
      errorHideTimerRef.current = setTimeout(() => {
        setErrorMessage("");
        errorHideTimerRef.current = null;
      }, 3200);
    },
    [clearErrorHideTimer]
  );

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
      mediaRef.current?.paused !== false ||
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
        mediaRef.current?.paused !== false ||
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
    if (!isFallbackFullscreen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFallbackFullscreen(false);
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isFallbackFullscreen]);

  useEffect(() => {
    setSupportsNativeShare(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    const audio = mediaRef.current;

    return () => {
      sourceGenerationRef.current += 1;
      audio?.pause();
      clearControlsHideTimer();
      clearErrorHideTimer();
    };
  }, [clearControlsHideTimer, clearErrorHideTimer]);

  const playAudio = useCallback(async () => {
    const audio = mediaRef.current;
    if (!audio) return;
    const sourceGeneration = sourceGenerationRef.current;

    try {
      wantsPlaybackRef.current = true;
      setIsLoading(true);
      setErrorMessage("");
      await audio.play();
      if (sourceGeneration !== sourceGenerationRef.current) return;
      setIsPlaying(true);
      setIsLoading(false);
      setArePlayerControlsVisible(true);
      scheduleControlsHide();
    } catch (error) {
      const wasSuperseded =
        sourceGeneration !== sourceGenerationRef.current;
      const wasAborted =
        error instanceof DOMException && error.name === "AbortError";

      if (wasSuperseded) return;

      if (wasAborted) {
        wantsPlaybackRef.current = false;
        setIsPlaying(false);
        setIsLoading(false);
        keepControlsVisible();
        return;
      }

      wantsPlaybackRef.current = false;
      setIsPlaying(false);
      setIsLoading(false);
      keepControlsVisible();
      showErrorTemporarily("تعذر تشغيل التسجيل، يرجى المحاولة لاحقًا");

      if (process.env.NODE_ENV !== "production") {
        console.warn("Audio play() failed", {
          url: audio.currentSrc || audio.src,
          error,
        });
      }
    }
  }, [keepControlsVisible, scheduleControlsHide, showErrorTemporarily]);

  function loadPlayableSource(
    source: string,
    startTime: number,
    shouldPlay: boolean
  ) {
    const audio = mediaRef.current;
    if (!audio) return;

    sourceGenerationRef.current += 1;
    wantsPlaybackRef.current = shouldPlay;
    audio.pause();
    pendingSeekRef.current = Math.max(0, startTime);
    setIsLoading(shouldPlay);

    const playableSource = getFullscreenVideoUrl(source);
    const nextSource = new URL(playableSource, window.location.href).href;
    if (audio.src !== nextSource || audio.error) {
      audio.src = playableSource;
      audio.load();
    } else if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
      audio.currentTime = pendingSeekRef.current;
      pendingSeekRef.current = null;
      setCurrentTime(audio.currentTime);
    }

    if (shouldPlay) void playAudio();
  }

  useEffect(() => {
    const audio = mediaRef.current;
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
    }

    function handlePlaying() {
      if (!wantsPlaybackRef.current) return;

      setIsPlaying(true);
      setIsLoading(false);
      scheduleControlsHide();
    }

    function handleWaiting() {
      if (!wantsPlaybackRef.current) return;

      setIsPlaying(false);
      setIsLoading(true);
      keepControlsVisible();
    }

    function handlePause() {
      setIsPlaying(false);
      if (!wantsPlaybackRef.current) setIsLoading(false);
    }

    function handleTimeUpdate() {
      setCurrentTime(media.currentTime);
    }

    function handleEnded() {
      wantsPlaybackRef.current = false;
      setIsPlaying(false);
      setIsLoading(false);
      keepControlsVisible();
      setCurrentTime(Number.isFinite(media.duration) ? media.duration : media.currentTime);
    }

    function handleError() {
      wantsPlaybackRef.current = false;
      setIsPlaying(false);
      setIsLoading(false);
      keepControlsVisible();
      showErrorTemporarily("تعذر تشغيل التسجيل، يرجى المحاولة لاحقًا");

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
    media.addEventListener("playing", handlePlaying);
    media.addEventListener("waiting", handleWaiting);
    media.addEventListener("pause", handlePause);
    media.addEventListener("timeupdate", handleTimeUpdate);
    media.addEventListener("ended", handleEnded);
    media.addEventListener("error", handleError);

    return () => {
      media.removeEventListener("loadedmetadata", handleMetadata);
      media.removeEventListener("durationchange", handleMetadata);
      media.removeEventListener("playing", handlePlaying);
      media.removeEventListener("waiting", handleWaiting);
      media.removeEventListener("pause", handlePause);
      media.removeEventListener("timeupdate", handleTimeUpdate);
      media.removeEventListener("ended", handleEnded);
      media.removeEventListener("error", handleError);
    };
  }, [
    keepControlsVisible,
    playAudio,
    playbackRate,
    scheduleControlsHide,
    showErrorTemporarily,
  ]);

  useEffect(() => {
    const audio = mediaRef.current;
    const source = selectedLesson?.audioUrl;
    if (!audio || !source) return;

    const playableSource = getFullscreenVideoUrl(source);
    const nextSource = new URL(playableSource, window.location.href).href;
    if (audio.src === nextSource) return;

    pendingSeekRef.current = Math.max(0, selectedLesson.startAt ?? 0);
    audio.src = playableSource;
    audio.load();
  }, [selectedLesson?.audioUrl, selectedLesson?.startAt]);

  function getLessonUrl(lesson: Lesson) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("lesson", lesson.id);
    nextUrl.hash = "";
    return nextUrl.toString();
  }

  function updateUrl(lesson: Lesson) {
    window.history.replaceState(null, "", getLessonUrl(lesson));
  }

  async function shareSelectedLesson() {
    if (!selectedLesson) return;

    const url = getLessonUrl(selectedLesson);
    const title = `${book.title} – ${selectedLessonTitle}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else if (!copyWithSelectionFallback(url)) {
        throw new Error("Clipboard copy failed");
      }

      setShareStatus("copied");
    } catch {
      try {
        setShareStatus(copyWithSelectionFallback(url) ? "copied" : "error");
      } catch {
        setShareStatus("error");
      }
    }

    window.setTimeout(() => setShareStatus("idle"), 2600);
  }

  function selectLesson(lesson: Lesson, shouldPlay = true) {
    if (!lesson.audioUrl) return;

    setErrorMessage("");
    setIsPlaying(false);
    setIsLoading(shouldPlay);
    keepControlsVisible();
    setCurrentTime(0);
    setDuration(0);
    setSelectedLesson(lesson);
    setShowsMainCourseCover(false);
    updateUrl(lesson);
    loadPlayableSource(lesson.audioUrl, lesson.startAt ?? 0, shouldPlay);

    if (window.matchMedia("(max-width: 639px)").matches) {
      window.requestAnimationFrame(() => {
        playerRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      });
    }
  }

  function togglePlayback() {
    const audio = mediaRef.current;
    if (!audio || !selectedLesson?.audioUrl) return;

    setShowsMainCourseCover(false);

    if (isPlaying || isLoading) {
      sourceGenerationRef.current += 1;
      wantsPlaybackRef.current = false;
      audio.pause();
      setIsPlaying(false);
      setIsLoading(false);
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
    const audio = mediaRef.current;
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
    const audio = mediaRef.current;
    const nextMuted = !isMuted;

    if (audio) audio.muted = nextMuted;
    setIsMuted(nextMuted);
  }

  function handleVolumeChange(value: string) {
    const audio = mediaRef.current;
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

    if (mediaRef.current) {
      mediaRef.current.playbackRate = nextRate;
    }

    setPlaybackRate(nextRate);
  }

  useEffect(() => {
    const video =
      mediaRef.current as IOSFullscreenVideoElement | null;

    if (!video) return;

    function clearPauseIntentTimer() {
      if (iosPauseIntentTimerRef.current === null) return;

      clearTimeout(iosPauseIntentTimerRef.current);
      iosPauseIntentTimerRef.current = null;
    }

    function clearResumeTimer() {
      if (iosResumeTimerRef.current === null) return;

      clearTimeout(iosResumeTimerRef.current);
      iosResumeTimerRef.current = null;
    }

    function handleBeginFullscreen() {
      clearPauseIntentTimer();
      clearResumeTimer();

      iosResumeAfterFullscreenRef.current =
        !video!.paused && !video!.ended;

      setIsIOSVideoFullscreen(true);
    }

    function handleNativePlay() {
      if (!video!.webkitDisplayingFullscreen) return;

      clearPauseIntentTimer();
      iosResumeAfterFullscreenRef.current = true;
    }

    function handleNativePause() {
      if (!video!.webkitDisplayingFullscreen) return;

      clearPauseIntentTimer();

      /*
       * Native iOS fullscreen also fires pause while it is
       * beginning the exit animation.
       *
       * Do not immediately treat that pause as intentional.
       * If the video remains paused inside fullscreen for a
       * while, then it really was a user pause.
       */
      iosPauseIntentTimerRef.current = setTimeout(() => {
        if (
          video!.webkitDisplayingFullscreen &&
          video!.paused
        ) {
          iosResumeAfterFullscreenRef.current = false;
        }

        iosPauseIntentTimerRef.current = null;
      }, 900);
    }

    function handleEndFullscreen() {
      clearPauseIntentTimer();
      clearResumeTimer();

      const shouldResume =
        iosResumeAfterFullscreenRef.current;

      setIsIOSVideoFullscreen(false);
      setCurrentTime(video!.currentTime);
      setIsLoading(false);
      keepControlsVisible();

      if (!shouldResume || video!.ended) {
        wantsPlaybackRef.current = false;
        setIsPlaying(false);
        return;
      }

      /*
       * Do NOT call play() immediately here.
       *
       * iOS can still be completing the native fullscreen
       * dismissal and can issue its automatic pause AFTER
       * webkitendfullscreen.
       */
      wantsPlaybackRef.current = true;
      setIsPlaying(false);

      function attemptResume(finalAttempt: boolean) {
        if (
          !iosResumeAfterFullscreenRef.current ||
          video!.ended
        ) {
          return;
        }

        if (!video!.paused) {
          setIsPlaying(true);
          setIsLoading(false);
          return;
        }

        void video!.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);

            /*
             * Safari may still apply its exit pause shortly
             * after play() resolves, so check once more.
             */
            if (!finalAttempt) {
              iosResumeTimerRef.current = setTimeout(() => {
                attemptResume(true);
              }, 650);
            }
          })
          .catch((error) => {
            if (!finalAttempt) {
              iosResumeTimerRef.current = setTimeout(() => {
                attemptResume(true);
              }, 650);
              return;
            }

            wantsPlaybackRef.current = false;
            setIsPlaying(false);
            setIsLoading(false);
            keepControlsVisible();

            if (process.env.NODE_ENV !== "production") {
              console.warn(
                "Could not resume after iPhone fullscreen exit",
                error
              );
            }
          });
      }

      /*
       * Native iPhone fullscreen dismissal animation needs
       * time to finish before inline playback is reliable.
       */
      iosResumeTimerRef.current = setTimeout(() => {
        attemptResume(false);
      }, 550);
    }

    video.addEventListener(
      "webkitbeginfullscreen",
      handleBeginFullscreen
    );
    video.addEventListener(
      "webkitendfullscreen",
      handleEndFullscreen
    );
    video.addEventListener("play", handleNativePlay);
    video.addEventListener("pause", handleNativePause);

    return () => {
      clearPauseIntentTimer();
      clearResumeTimer();

      video.removeEventListener(
        "webkitbeginfullscreen",
        handleBeginFullscreen
      );
      video.removeEventListener(
        "webkitendfullscreen",
        handleEndFullscreen
      );
      video.removeEventListener("play", handleNativePlay);
      video.removeEventListener("pause", handleNativePause);
    };
  }, [keepControlsVisible]);

  async function toggleFullscreen() {
    if (isIPhoneBrowser()) {
      const video =
        mediaRef.current as IOSFullscreenVideoElement | null;

      if (!video || !fullscreenVideoUrl) {
        showErrorTemporarily("تعذر تجهيز ملء الشاشة");
        return;
      }

      if (
        video.readyState < HTMLMediaElement.HAVE_METADATA ||
        video.webkitSupportsFullscreen === false
      ) {
        video.load();
        showErrorTemporarily(
          "جارٍ تجهيز ملء الشاشة، حاول مرة أخرى بعد لحظة"
        );
        return;
      }

      const enterFullscreen =
        video.webkitEnterFullscreen ??
        video.webkitEnterFullScreen;

      if (!enterFullscreen) {
        showErrorTemporarily("ملء الشاشة غير مدعوم على هذا الجهاز");
        return;
      }

      try {
        enterFullscreen.call(video);
      } catch (error) {
        showErrorTemporarily("تعذر فتح ملء الشاشة");

        if (process.env.NODE_ENV !== "production") {
          console.error("iPhone video fullscreen failed", error);
        }
      }

      return;
    }

    if (isFallbackFullscreen) {
      setIsFallbackFullscreen(false);
      return;
    }

    const canUseFullscreen =
      document.fullscreenEnabled && Boolean(playerRef.current?.requestFullscreen);

    if (!playerRef.current) return;

    if (!canUseFullscreen) {
      setErrorMessage("");
      setIsFallbackFullscreen(true);
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await playerRef.current.requestFullscreen();
      }
    } catch (error) {
      if (!document.fullscreenElement) {
        setErrorMessage("");
        setIsFallbackFullscreen(true);
      } else {
        showErrorTemporarily("تعذر الخروج من ملء الشاشة");
      }

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
    <div dir="rtl" className="min-w-0 space-y-4 sm:space-y-5">
      <div
        className={
          playerOnly
            ? "block"
            : [
              "grid gap-5",
              usesSectionedLessonIndex
                ? "xl:grid-cols-[minmax(0,1fr)_360px]"
                : "xl:grid-cols-[minmax(0,1fr)_320px]",
            ].join(" ")
        }
      >
        <section className="min-w-0 space-y-3 sm:space-y-4">
          {!playerOnly ? (
            <div className="flex flex-col gap-3 px-0.5 sm:flex-row sm:items-end sm:justify-between sm:px-0">
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-xs font-bold text-amber-700 sm:text-sm">تسجيل صوتي</p>

                <h1 className="text-2xl font-bold leading-tight text-stone-950 sm:text-3xl">
                  {book.title}
                </h1>

                <p className="text-base font-semibold leading-7 text-emerald-950 sm:text-lg sm:leading-8">
                  {selectedLessonTitle}
                </p>
              </div>

              <button
                type="button"
                onClick={shareSelectedLesson}
                aria-label={
                  supportsNativeShare
                    ? "مشاركة هذا الدرس"
                    : "نسخ رابط هذا الدرس"
                }
                className={[
                  "inline-flex min-h-10 w-fit items-center justify-center gap-2 self-start rounded-lg border px-3.5 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:ring-offset-2 sm:self-auto",
                  shareStatus === "copied"
                    ? "border-emerald-800 bg-emerald-800 text-white"
                    : shareStatus === "error"
                      ? "border-red-700 bg-red-50 text-red-800"
                      : "border-stone-300 bg-white text-stone-800 hover:border-emerald-800 hover:bg-emerald-50 hover:text-emerald-950",
                ].join(" ")}
              >
                {shareStatus === "copied" ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : supportsNativeShare ? (
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                <span aria-live="polite">
                  {shareStatus === "copied"
                    ? "تم نسخ الرابط"
                    : shareStatus === "error"
                      ? "تعذر النسخ"
                      : supportsNativeShare
                        ? "مشاركة الدرس"
                        : "نسخ رابط الدرس"}
                </span>
              </button>
            </div>
          ) : null}
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
              "relative w-full max-w-full scroll-mt-28 overflow-hidden bg-stone-950 text-white shadow-[0_22px_70px_rgba(57,44,24,0.14)]",
              isPlayerFullscreen
                ? isFallbackFullscreen
                  ? "fixed inset-0 z-[100] h-[100dvh] w-screen max-w-none rounded-none border-0 shadow-none"
                  : "h-screen w-screen rounded-none border-0 shadow-none"
                : [
                    "aspect-video rounded-xl border border-[#d8c59d]",
                    playerOnly
                      ? "min-h-0"
                      : "min-h-0 sm:min-h-[430px]",
                  ].join(" "),
            ].join(" ")}
          >
            {fullscreenVideoUrl ? (
              <video
                ref={mediaRef}
                preload="metadata"
                playsInline
                controls
                tabIndex={-1}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-contain"
              />
            ) : null}

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
                "absolute inset-x-0 top-0 z-10 p-2.5 transition-opacity duration-300 sm:p-5",
                arePlayerControlsVisible
                  ? "opacity-100"
                  : "pointer-events-none opacity-0",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold leading-4 text-amber-100 sm:text-sm">
                    الدرس {selectedLessonNumber} من {selectedLessonTotal}
                  </p>
                  <h2 className="max-w-3xl truncate text-sm font-bold leading-6 text-white sm:mt-1 sm:text-2xl sm:leading-8">
                    {selectedLessonTitle}
                  </h2>
                </div>
                {selectedLesson.section ? (
                  <span className="hidden max-w-40 shrink-0 truncate rounded-full border border-white/25 bg-black/35 px-3 py-1 text-sm font-bold text-white backdrop-blur sm:block">
                    {selectedLesson.section}
                  </span>
                ) : null}
              </div>
            </div>

            <div
              data-center-controls
              data-visible={arePlayerControlsVisible ? "true" : "false"}
              className={[
                "pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4 transition-opacity duration-300",
                arePlayerControlsVisible
                  ? "opacity-100"
                  : "opacity-0",
              ].join(" ")}
            >
              <div className="grid grid-cols-[auto_auto_auto] items-center gap-2 sm:gap-5">
                <button
                  type="button"
                  onClick={skipForward}
                  aria-label="تقديم 10 ثوانٍ"
                  className="pointer-events-auto inline-flex h-10 min-w-11 items-center justify-center gap-0.5 rounded-full border border-white/25 bg-black/45 px-2 text-xs font-bold text-white shadow-lg backdrop-blur transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-amber-200 sm:h-14 sm:min-w-16 sm:gap-1 sm:px-3 sm:text-sm"
                >
                  <span>10</span>
                  <RotateCw className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={togglePlayback}
                  aria-label={isLoading ? "جارٍ تشغيل الدرس" : isPlaying ? "إيقاف" : "تشغيل"}
                  aria-busy={isLoading}
                  className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white shadow-2xl shadow-black/40 backdrop-blur transition hover:scale-105 hover:bg-emerald-950/80 focus:outline-none focus:ring-2 focus:ring-amber-200 sm:h-24 sm:w-24"
                >
                  {isLoading ? (
                    <LoaderCircle className="h-7 w-7 animate-spin sm:h-9 sm:w-9" aria-hidden="true" />
                  ) : isPlaying ? (
                    <Pause className="h-7 w-7 sm:h-9 sm:w-9" aria-hidden="true" fill="currentColor" />
                  ) : (
                    <Play className="h-7 w-7 sm:h-9 sm:w-9" aria-hidden="true" fill="currentColor" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={skipBackward}
                  aria-label="رجوع 10 ثوانٍ"
                  className="pointer-events-auto inline-flex h-10 min-w-11 items-center justify-center gap-0.5 rounded-full border border-white/25 bg-black/45 px-2 text-xs font-bold text-white shadow-lg backdrop-blur transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-amber-200 sm:h-14 sm:min-w-16 sm:gap-1 sm:px-3 sm:text-sm"
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
                "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/65 to-transparent p-2.5 pt-7 transition-opacity duration-300 sm:p-5 sm:pt-14",
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

              <div className="mt-1.5 flex items-center justify-between gap-2 sm:mt-3 sm:gap-3">
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <div
                    dir="ltr"
                    className="text-[11px] font-semibold tabular-nums text-white/85 sm:text-sm"
                  >
                    {formatTime(currentTime)} / {displayedDuration ?? "تحميل المدة…"}
                  </div>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label={isPlayerFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-amber-200 sm:h-10 sm:w-10"
                  >
                    {isPlayerFullscreen ? (
                      <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                    ) : (
                      <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>

                <div dir="ltr" className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-amber-200 sm:h-10 sm:w-10"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                    ) : (
                      <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
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
                    className="audio-range hidden h-1 w-20 cursor-pointer accent-amber-300 sm:block sm:w-28"
                  />
                  <select
                    value={String(playbackRate)}
                    onChange={(event) =>
                      handlePlaybackRateChange(event.target.value)
                    }
                    onFocus={keepControlsVisible}
                    onBlur={endControlsInteraction}
                    aria-label="سرعة التشغيل"
                    className="h-8 rounded-md border border-white/20 bg-black/35 px-1.5 text-xs font-bold text-white outline-none transition hover:bg-black/55 focus:ring-2 focus:ring-amber-200 sm:h-10 sm:px-2 sm:text-sm"
                  >
                    {playbackRates.map((rate) => (
                      <option key={rate} value={String(rate)}>
                        {rate}x
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </article>

          {!playerOnly ? (
            <div className="rounded-lg border border-[#e0d2b4] bg-[#fffdf7] p-3 shadow-[0_12px_35px_rgba(57,44,24,0.08)] sm:p-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div>
                  <p className="text-sm font-bold text-amber-700">الدرس التالي</p>
                  <p className="mt-1 text-base leading-7 text-stone-700">
                    {nextLesson
                      ? usesSectionedLessonIndex
                        ? `الدرس ${(groupedLessons[nextLesson.section || "الدروس"] ?? []).findIndex(
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
                  className="w-full rounded-md bg-emerald-900 px-6 py-3 text-base font-bold text-white shadow-[0_10px_24px_rgba(6,78,59,0.22)] transition hover:bg-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none sm:w-auto"
                >
                  {nextLesson ? "تشغيل الدرس التالي" : "آخر درس"}
                </button>
              </div>
            </div>
          ) : null}
        </section>

        {!playerOnly ? (
          <aside
            className={[
              "min-w-0 max-w-full rounded-lg border border-[#dfd1b4] bg-[#fffdf7] p-2.5 shadow-[0_14px_45px_rgba(57,44,24,0.08)] sm:p-3 xl:sticky xl:top-28",
              usesSectionedLessonIndex
                ? "xl:max-h-[720px]"
                : "xl:max-h-[560px]",
            ].join(" ")}
          >
            {usesSectionedLessonIndex ? (
              <>
                <div className="mb-3 border-b border-[#eadfc8] pb-3">
                  <h2 className="text-xl font-bold leading-8 text-stone-950">
                    قائمة الدروس
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm leading-6 text-stone-500">
                      اختر كتاباً لعرض دروسه، أو انتقل بالتتابع من الأزرار
                    </p>
                    <span className="rounded-full bg-emerald-900 px-3 py-1 text-xs font-bold text-white">
                      {lessons.length} درسًا إجمالًا
                    </span>
                  </div>
                </div>

                <div className="lesson-scroll space-y-2.5 overflow-visible pl-0 pr-0 sm:space-y-3 xl:max-h-[600px] xl:overflow-y-auto xl:pl-1 xl:pr-0.5">
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
                                "flex w-full min-w-0 items-center justify-between gap-2 p-3 text-start font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-800 sm:gap-4 sm:p-4",
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
                                const isActiveLoading = isActive && isLoading;

                                return (
                                  <a
                                    key={lesson.id}
                                    href={`/books/${book.slug}?lesson=${encodeURIComponent(lesson.id)}`}
                                    onClick={(event) => {
                                      event.preventDefault();
                                      selectLesson(lesson);
                                    }}
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
                                      {isActivePlaying || isActiveLoading || lesson.duration ? (
                                        <span className="mt-0.5 block text-sm font-semibold text-stone-500">
                                          {isActiveLoading
                                            ? "جارٍ التشغيل"
                                            : isActivePlaying
                                            ? "قيد التشغيل"
                                            : lesson.duration}
                                        </span>
                                      ) : null}
                                    </span>
                                  </a>
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
                    const isActiveLoading = isActive && isLoading;

                    return (
                      <a
                        key={lesson.id}
                        href={`/books/${book.slug}?lesson=${encodeURIComponent(lesson.id)}`}
                        onClick={(event) => {
                          event.preventDefault();
                          selectLesson(lesson);
                        }}
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
                            {isActiveLoading
                              ? "جارٍ التشغيل"
                              : isActivePlaying
                              ? "قيد التشغيل"
                              : lesson.duration ?? lesson.section ?? "تسجيل صوتي"}
                          </span>
                        </span>
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </aside>
        ) : null}
      </div>

    </div>
  );
}
