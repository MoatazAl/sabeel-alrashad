"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { LessonList } from "@/components/lesson-list";
import { RecordingCoursePlayer } from "@/components/recording-course-player";
import { getYouTubeLessonThumbnailSources } from "@/lib/course-images";
import { groupLessons } from "@/lib/library";
import type { Book, Lesson } from "@/lib/types";
import { getVideoEmbedUrl } from "@/lib/youtube";

type BookPlaylistProps = {
  book: Book;
  initialLessonId?: string;
};

export function BookPlaylist({
  book,
  initialLessonId,
}: BookPlaylistProps) {
  const hasAudioLessons = book.lessons.some((lesson) => lesson.audioUrl);

  if (hasAudioLessons) {
    return (
      <RecordingCoursePlayer book={book} initialLessonId={initialLessonId} />
    );
  }

  return <VideoBookPlaylist book={book} initialLessonId={initialLessonId} />;
}

function VideoBookPlaylist({
  book,
  initialLessonId,
}: BookPlaylistProps) {

  const initialLesson =
    book.lessons.find((lesson) => lesson.id === initialLessonId) ??
    book.lessons[0];

  const [currentLesson, setCurrentLesson] = useState<Lesson>(initialLesson);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const currentIndex = book.lessons.findIndex(
    (lesson) => lesson.id === currentLesson.id
  );
  const previousLesson = book.lessons[currentIndex - 1];
  const nextLesson = book.lessons[currentIndex + 1];
  const groupedLessons = useMemo(() => groupLessons(book.lessons), [book.lessons]);
  const embedUrl = currentLesson.youtubeUrl
    ? getVideoEmbedUrl(currentLesson.youtubeUrl)
    : null;
  const currentImage =
    currentLesson.image ??
    currentLesson.coverImage ??
    book.cover ??
    book.coverImage;

  function selectLesson(lessonId: string) {
    const lesson = book.lessons.find((item) => item.id === lessonId);
    if (!lesson) return;

    setCurrentLesson(lesson);
    setOpenSection(lesson.section || "الدروس");

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("lesson", lesson.id);
    window.history.replaceState(null, "", nextUrl.toString());
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        {currentLesson.audioUrl ? (
          <div className="space-y-4">
            {currentImage ? (
              <div className="relative aspect-video overflow-hidden rounded-md bg-stone-100">
                <Image
                  key={`${currentLesson.id}-image`}
                  src={currentImage}
                  alt={`صورة ${currentLesson.title}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) calc(100vw - 440px), 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="rounded-md border border-stone-200 bg-stone-50 p-4">
              <audio
                key={currentLesson.id}
                controls
                className="w-full"
                src={currentLesson.audioUrl}
              />
            </div>
          </div>
        ) : (
          <div className="aspect-video overflow-hidden rounded-md bg-stone-950">
            {embedUrl ? (
              <iframe
                key={currentLesson.id}
                src={embedUrl}
                title={currentLesson.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white">
                تعذر تحميل المادة
              </div>
            )}
          </div>
        )}

        <div className="mt-5">
          <div className="flex flex-wrap gap-2 text-sm font-medium">
            <span className="rounded-full border border-teal-900/15 bg-teal-50 px-3 py-1 text-teal-900">
              {book.category}
            </span>
            {currentLesson.section ? (
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-stone-600">
                {currentLesson.section}
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-stone-950">
            {book.title}
          </h1>
          <p className="mt-4 text-xl font-semibold text-stone-700">
            {currentLesson.title}
          </p>
          <p className="mt-2 text-base leading-8 text-stone-500">
            الشارح: {book.explainerName} · المؤلف: {book.authorName}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => previousLesson && selectLesson(previousLesson.id)}
            disabled={!previousLesson}
            className="rounded-md border border-stone-300 bg-white px-5 py-2.5 text-base font-semibold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
          >
            الدرس السابق
          </button>
          <button
            type="button"
            onClick={() => nextLesson && selectLesson(nextLesson.id)}
            disabled={!nextLesson}
            className="rounded-md bg-teal-800 px-6 py-2.5 text-base font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            الدرس التالي
          </button>
        </div>

        {nextLesson ? (
          <div className="mt-6 rounded-md border border-stone-200 bg-stone-50 p-5">
            <p className="text-base text-stone-500">التالي في السلسلة</p>
            <button
              type="button"
              onClick={() => selectLesson(nextLesson.id)}
              className="mt-1 text-right text-lg font-semibold text-teal-900"
            >
              {nextLesson.section ? `${nextLesson.section} - ` : ""}
              {nextLesson.title}
            </button>
          </div>
        ) : null}
      </section>

      <aside className="min-w-0 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-stone-950">قائمة الدروس</h2>
          <p className="mt-2 text-base text-stone-500">
            اختر باباً لعرض دروسه، أو انتقل بالتتابع من الأزرار.
          </p>
        </div>

        <div className="max-h-[720px] space-y-3 overflow-y-auto ps-1">
          {Object.entries(groupedLessons).map(
            ([section, lessons], sectionIndex) => {
              const isOpen = openSection === section;
              const containsCurrentLesson = lessons.some(
                (lesson) => lesson.id === currentLesson.id
              );
              const panelId = `lesson-section-${sectionIndex}`;

              return (
                <section
                  key={section}
                  className={`overflow-hidden rounded-xl border bg-white transition ${
                    isOpen
                      ? "border-emerald-800/25 shadow-sm"
                      : "border-stone-200/80"
                  }`}
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
                      className={`flex w-full items-center justify-between gap-4 p-4 text-start font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-800 ${
                        isOpen
                          ? "bg-emerald-50 text-emerald-950"
                          : containsCurrentLesson
                            ? "bg-stone-50 text-stone-950"
                            : "text-stone-800 hover:bg-stone-50"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                        <span>{section}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                        {lessons.length} {lessons.length === 1 ? "درس" : "دروس"}
                      </span>
                    </button>
                  </h3>

                  {isOpen ? (
                    <div id={panelId} className="border-t border-stone-100 p-2">
                      <LessonList
                        compact
                        items={lessons.map((lesson) => ({
                          id: lesson.id,
                          title: lesson.title,
                          section: lesson.duration,
                          imageSources:
                            book.source === "youtube"
                              ? getYouTubeLessonThumbnailSources(lesson)
                              : undefined,
                        }))}
                        currentLessonId={currentLesson.id}
                        onSelect={selectLesson}
                      />
                    </div>
                  ) : null}
                </section>
              );
            }
          )}
        </div>
      </aside>
    </div>
  );
}
