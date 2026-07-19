"use client";

import Image from "next/image";
import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";

type AudioLesson = {
  number: number;
  title: string;
  audioUrl: string;
  coverImage: string;
  startAt?: number;
  duration?: string;
};

type AudioSeriesPlayerProps = {
  title: string;
  sheikh: string;
  description: string;
  coverImage: string;
  lessons: AudioLesson[];
};

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "00:00";

  const seconds = Math.floor(totalSeconds);
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function AudioSeriesPlayer({
  title,
  sheikh,
  description,
  coverImage,
  lessons,
}: AudioSeriesPlayerProps) {
  const firstLesson = lessons[0];
  const audioRef = useRef<HTMLAudioElement>(null);
  const selectedLessonRef = useRef<AudioLesson>(firstLesson);
  const lessonDurationRef = useRef(0);
  const pendingSeekRef = useRef<number | null>(null);
  const shouldPlayAfterLoadRef = useRef(false);

  const [selectedLesson, setSelectedLesson] = useState<AudioLesson>(firstLesson);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [lessonDuration, setLessonDuration] = useState(0);
  const [isTheaterOpen, setIsTheaterOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const sliderMax = lessonDuration > 0
    ? Math.max(lessonDuration, 1)
    : Math.max(currentTime, 1);
  const progressPercent = Math.min(
    100,
    Math.max(0, (Math.min(currentTime, sliderMax) / sliderMax) * 100)
  );
  const progressStyle = {
    "--range-progress": `${progressPercent}%`,
  } as CSSProperties;
  const activeCoverImage = selectedLesson.coverImage || coverImage;
  const durationLabel = lessonDuration > 0 ? formatTime(lessonDuration) : "--:--";
  const currentLessonIndex = lessons.findIndex(
    (lesson) => lesson.number === selectedLesson.number
  );
  const previousLesson = lessons[currentLessonIndex - 1];
  const nextLesson = lessons[currentLessonIndex + 1];
  const displayedDuration =
    selectedLesson.duration ?? (lessonDuration > 0 ? durationLabel : null);

  function setSelectedLessonState(lesson: AudioLesson) {
    selectedLessonRef.current = lesson;
    setSelectedLesson(lesson);
  }

  async function playAudio(audio: HTMLAudioElement) {
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }

  function loadPlayableSource(src: string, startTime: number, shouldPlay: boolean) {
    const audio = audioRef.current;
    if (!audio) return;

    pendingSeekRef.current = Math.max(0, startTime);
    shouldPlayAfterLoadRef.current = shouldPlay;
    audio.src = src;
    audio.load();
  }

  function beginLesson(lesson: AudioLesson) {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setIsPlaying(false);
    setSelectedLessonState(lesson);
    lessonDurationRef.current = 0;
    setLessonDuration(0);
    setCurrentTime(0);
    loadPlayableSource(lesson.audioUrl, lesson.startAt ?? 0, true);
  }

  function seekToTime(targetTime: number, shouldResume = isPlaying) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(targetTime)) return;

    const maxDuration = lessonDurationRef.current;
    const target =
      maxDuration > 0
        ? Math.min(Math.max(0, targetTime), maxDuration)
        : Math.max(0, targetTime);

    setCurrentTime(target);

    if (audio.currentSrc) {
      audio.currentTime = target;
      if (shouldResume) void playAudio(audio);
      return;
    }

    loadPlayableSource(selectedLessonRef.current.audioUrl, target, shouldResume);
  }

  useEffect(() => {
    const lessonProbe = new Audio();
    lessonProbe.preload = "metadata";

    function updateLessonDuration() {
      const nextDuration = Number.isFinite(lessonProbe.duration)
        ? lessonProbe.duration
        : 0;
      lessonDurationRef.current = nextDuration;
      setLessonDuration(nextDuration);
    }

    lessonProbe.addEventListener("loadedmetadata", updateLessonDuration);
    lessonProbe.src = selectedLesson.audioUrl;

    return () => {
      lessonProbe.removeEventListener("loadedmetadata", updateLessonDuration);
      lessonProbe.src = "";
    };
  }, [selectedLesson.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const media = audio;

    function applyPendingSeek() {
      const pendingSeek = pendingSeekRef.current;
      if (pendingSeek === null) return;

      media.currentTime = pendingSeek;
      pendingSeekRef.current = null;
      setCurrentTime(media.currentTime);
    }

    function handleMetadata() {
      const nextDuration = Number.isFinite(media.duration) ? media.duration : 0;
      lessonDurationRef.current = nextDuration;
      setLessonDuration(nextDuration);
      applyPendingSeek();

      if (shouldPlayAfterLoadRef.current) {
        shouldPlayAfterLoadRef.current = false;
        void playAudio(media);
      }
    }

    function updateCurrentTime() {
      setCurrentTime(media.currentTime);
    }

    function handleEnded() {
      setCurrentTime(lessonDurationRef.current || media.currentTime);
      setIsPlaying(false);
    }

    media.addEventListener("loadedmetadata", handleMetadata);
    media.addEventListener("durationchange", handleMetadata);
    media.addEventListener("timeupdate", updateCurrentTime);
    media.addEventListener("ended", handleEnded);

    return () => {
      media.removeEventListener("loadedmetadata", handleMetadata);
      media.removeEventListener("durationchange", handleMetadata);
      media.removeEventListener("timeupdate", updateCurrentTime);
      media.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    if (!isTheaterOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsTheaterOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isTheaterOpen]);

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    if (!audio.currentSrc) {
      loadPlayableSource(selectedLesson.audioUrl, selectedLesson.startAt ?? 0, true);
      return;
    }

    void playAudio(audio);
  }

  function handleLessonRowClick(lesson: AudioLesson) {
    if (lesson.number === selectedLesson.number) {
      togglePlayback();
      return;
    }

    beginLesson(lesson);
  }

  function selectAdjacentLesson(lesson?: AudioLesson) {
    if (!lesson) return;

    beginLesson(lesson);
  }

  function handleSeek(value: string) {
    seekToTime(Number(value));
  }

  function skipBackward() {
    seekToTime(currentTime - 10);
  }

  function skipForward() {
    seekToTime(currentTime + 10);
  }

  function toggleMute() {
    const audio = audioRef.current;
    const nextMuted = !isMuted;

    if (audio) {
      audio.muted = nextMuted;
    }

    setIsMuted(nextMuted);
  }

  function handleVolumeChange(value: string) {
    const audio = audioRef.current;
    const nextVolume = Number(value);
    if (!Number.isFinite(nextVolume)) return;

    const clampedVolume = Math.min(1, Math.max(0, nextVolume));
    const nextMuted = clampedVolume === 0;

    if (audio) {
      audio.volume = clampedVolume;
      audio.muted = nextMuted;
    }

    setVolume(clampedVolume);
    setIsMuted(nextMuted);
  }

  function renderSkipButton(direction: "back" | "forward", isDark = false) {
    const Icon = direction === "back" ? RotateCcw : RotateCw;
    const label = direction === "back" ? "رجوع 10 ثواني" : "تقديم 10 ثواني";
    const content =
      direction === "back" ? (
        <>
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span>10</span>
        </>
      ) : (
        <>
          <span>10</span>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </>
      );

    return (
      <button
        type="button"
        onClick={direction === "back" ? skipBackward : skipForward}
        aria-label={label}
        className={`inline-flex h-10 min-w-14 items-center justify-center gap-1 rounded-full border px-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 ${
          isDark
            ? "border-amber-200/25 bg-stone-950/55 text-amber-100 shadow-black/40 backdrop-blur-md hover:bg-stone-950/75 hover:text-white"
            : "border-[#d8c59d] bg-[#fffaf0] text-stone-800 hover:border-emerald-800/40 hover:bg-[#fff3d6]"
        }`}
      >
        {content}
      </button>
    );
  }

  function renderArtworkPlayButton(isTheater = false, fillArtwork = true) {
    const Icon = isPlaying ? Pause : Play;

    return (
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "إيقاف" : "تشغيل الدرس"}
        className={`group flex items-center justify-center transition ${
          fillArtwork ? "absolute inset-0" : "relative"
        } ${isPlaying ? "opacity-70 hover:opacity-100" : "opacity-100"}`}
      >
        <span
          className={`flex items-center justify-center rounded-full border border-amber-200/35 bg-stone-950/65 text-amber-100 shadow-2xl shadow-black/45 backdrop-blur-md transition group-hover:scale-105 group-hover:bg-emerald-950/80 group-hover:text-white ${
            isTheater ? "h-24 w-24 sm:h-28 sm:w-28" : "h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20"
          }`}
        >
          <Icon
            className={isTheater ? "h-10 w-10" : "h-9 w-9"}
            aria-hidden="true"
            fill="currentColor"
          />
        </span>
      </button>
    );
  }

  function renderTimeProgressOverlay(isTheater = false) {
    const SmallPlayIcon = isPlaying ? Pause : Play;
    const FullscreenIcon = isTheater ? Minimize2 : Maximize2;

    return (
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/95 via-stone-950/72 to-transparent px-4 pb-4 pt-16 ${
          isTheater ? "sm:px-8 sm:pb-5" : "sm:px-6"
        }`}
      >
        <div>
          <input
            type="range"
            min="0"
            max={sliderMax}
            step="1"
            value={Math.min(currentTime, sliderMax)}
            onChange={(event) => handleSeek(event.target.value)}
            aria-label={`تقدم تشغيل ${selectedLesson.title}`}
            style={progressStyle}
            className="audio-range h-2 w-full cursor-pointer accent-amber-300"
          />
        </div>
        <div
          dir="ltr"
          className="mt-3 flex items-center justify-between gap-3 text-white"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={isPlaying ? "إيقاف" : "تشغيل الدرس"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/12 text-white transition hover:bg-white/20 hover:text-amber-100"
            >
              <SmallPlayIcon
                className="h-4 w-4"
                aria-hidden="true"
                fill="currentColor"
              />
            </button>

            <span dir="ltr" className="shrink-0 text-sm font-semibold tabular-nums text-white/90">
              {formatTime(currentTime)} / {durationLabel}
            </span>

            <div dir="ltr" className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/12 text-white transition hover:bg-white/20 hover:text-amber-100"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(event) => handleVolumeChange(event.target.value)}
                aria-label="مستوى الصوت"
                style={{ "--range-progress": `${(isMuted ? 0 : volume) * 100}%` } as CSSProperties}
                className="audio-range hidden h-1 w-24 cursor-pointer accent-amber-300 md:block"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTheaterOpen(!isTheater)}
            aria-label={isTheater ? "الخروج من العرض المكبّر" : "عرض مكبّر"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/12 text-white transition hover:bg-white/20 hover:text-amber-100"
          >
            <FullscreenIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  function renderArtworkOverlayControls(isTheater = false) {
    return (
      <>
        <div className="absolute inset-0 flex items-center justify-center">
          {renderArtworkPlayButton(isTheater, false)}
          <div className="absolute right-[calc(50%+3.8rem)] top-1/2 -translate-y-1/2 sm:right-[calc(50%+5.25rem)]">
            {renderSkipButton("back", true)}
          </div>
          <div className="absolute left-[calc(50%+3.8rem)] top-1/2 -translate-y-1/2 sm:left-[calc(50%+5.25rem)]">
            {renderSkipButton("forward", true)}
          </div>
        </div>

        {renderTimeProgressOverlay(isTheater)}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-7 lg:flex-row lg:items-start">
        <section className="min-w-0 flex-1 space-y-5">
          <div className="overflow-hidden rounded-[22px] border border-[#d8c59d]/80 bg-[#fffaf0] shadow-[0_22px_70px_rgba(57,44,24,0.14)]">
            <div className="relative aspect-[16/10] bg-stone-100 sm:aspect-video">
              <Image
                src={activeCoverImage}
                alt={`صورة ${selectedLesson.title}`}
                fill
                priority
                sizes="(min-width: 1280px) 800px, (min-width: 1024px) calc(100vw - 470px), 100vw"
                className="object-contain"
              />
              <div className="absolute right-4 top-4 rounded-full border border-amber-200/70 bg-[#fffaf0]/92 px-3 py-1 text-xs font-bold text-emerald-950 shadow-sm backdrop-blur">
                الدرس {selectedLesson.number}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/78 via-stone-950/20 to-emerald-950/20" />
              {renderArtworkOverlayControls()}
            </div>
          </div>

          <div className="rounded-[20px] border border-[#e0d2b4] bg-[#fffdf7]/95 p-5 shadow-[0_14px_45px_rgba(57,44,24,0.08)] sm:p-6">
            <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
              <span className="rounded-full border border-emerald-900/15 bg-emerald-50 px-3 py-1 text-emerald-950">
                {title}
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-stone-700">
                الدرس {selectedLesson.number} من {lessons.length}
              </span>
              {displayedDuration ? (
                <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-stone-700">
                  المدة {displayedDuration}
                </span>
              ) : null}
            </div>

            <h2 className="mt-4 text-2xl font-bold leading-10 text-stone-950 sm:text-3xl">
              {selectedLesson.title}
            </h2>
            <p className="mt-2 text-lg font-semibold leading-8 text-emerald-950">
              {sheikh}
            </p>
            <p className="mt-3 max-w-3xl text-base leading-8 text-stone-700">
              {description}
            </p>
          </div>

          <div className="rounded-[20px] border border-[#e0d2b4] bg-[#fffdf7]/95 p-4 shadow-[0_14px_45px_rgba(57,44,24,0.08)] sm:p-5">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div>
                <p className="text-sm font-bold text-amber-700">الانتقال بين الدروس</p>
                <p className="mt-1 text-base leading-7 text-stone-700">
                  تابع السلسلة بالترتيب أو ارجع للدرس السابق عند الحاجة.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => selectAdjacentLesson(previousLesson)}
                  disabled={!previousLesson}
                  className="rounded-full border border-[#d8c59d] bg-white px-5 py-3 text-base font-bold text-stone-700 transition hover:border-emerald-800/35 hover:bg-[#fffaf0] disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
                >
                  الدرس السابق
                </button>
                <button
                  type="button"
                  onClick={() => selectAdjacentLesson(nextLesson)}
                  disabled={!nextLesson}
                  className="rounded-full bg-emerald-900 px-6 py-3 text-base font-bold text-white shadow-[0_10px_24px_rgba(6,78,59,0.22)] transition hover:bg-emerald-950 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
                >
                  الدرس التالي
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="min-w-0 rounded-[20px] border border-[#dfd1b4] bg-[#fffdf7]/95 p-4 shadow-[0_18px_55px_rgba(57,44,24,0.10)] lg:sticky lg:top-28 lg:w-[370px] lg:shrink-0">
          <div className="mb-4 border-b border-[#eadfc8] pb-4">
            <p className="text-sm font-bold text-amber-700">فهرس السلسلة</p>
            <h2 className="mt-1 text-2xl font-bold leading-9 text-stone-950">
              الدروس
            </h2>
            <p className="mt-2 text-base leading-8 text-stone-700">
              {lessons.length} درسا صوتيا مرتبا للاستماع والمتابعة.
            </p>
          </div>

          <div className="lesson-scroll max-h-[620px] space-y-2 overflow-y-auto pl-1 pr-0.5 lg:max-h-[calc(100vh-290px)]">
            {lessons.map((lesson) => {
              const isActive = lesson.number === selectedLesson.number;
              const isActivePlaying = isActive && isPlaying;

              return (
                <button
                  key={lesson.number}
                  type="button"
                  onClick={() => handleLessonRowClick(lesson)}
                  className={`relative flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-right transition ${
                    isActive
                      ? "border-emerald-800/45 bg-emerald-50/90 text-emerald-950 shadow-sm"
                      : "border-[#eee5d4] bg-white/80 text-stone-700 hover:border-[#d8c59d] hover:bg-[#fffaf0]"
                  }`}
                >
                  {isActive ? (
                    <span className="absolute right-0 top-3 h-8 w-1 rounded-l-full bg-amber-500" />
                  ) : null}
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                      isActive
                        ? "border-emerald-900 bg-emerald-900 text-amber-50"
                        : "border-[#e7dac0] bg-[#fbf7ee] text-stone-600"
                    }`}
                  >
                    {lesson.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold leading-7">
                      {lesson.title}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold text-stone-600">
                      {isActivePlaying
                        ? "قيد التشغيل"
                        : lesson.duration ?? "درس صوتي"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      <audio ref={audioRef} preload="metadata" />

      {isTheaterOpen ? (
        <div
          className="fixed inset-0 z-[100] bg-[#020403] text-white"
          role="dialog"
          aria-modal="true"
          aria-label={`عرض مكبر لـ ${selectedLesson.title}`}
        >
          <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/85 via-black/45 to-transparent px-4 py-4 sm:px-6">
            <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold leading-8 sm:text-2xl">
                  {selectedLesson.title}
                </h2>
                <p className="mt-1 text-sm text-white/70">{sheikh}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTheaterOpen(false)}
                className="shrink-0 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                إغلاق
              </button>
            </div>
          </div>

          <div className="flex h-full items-center justify-center px-3 py-24 sm:px-8">
            <div className="relative h-full w-full max-w-7xl">
              <Image
                src={activeCoverImage}
                alt={`صورة ${selectedLesson.title}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15" />
              {renderArtworkOverlayControls(true)}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

