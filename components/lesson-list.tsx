"use client";

import Link from "next/link";
import { FallbackImage } from "@/components/fallback-image";

export type LessonListItem = {
  id: string;
  title: string;
  section?: string;
  href?: string;
  bookTitle?: string;
  sheikhName?: string;
  imageSources?: string[];
};

type LessonListProps = {
  items: LessonListItem[];
  currentLessonId?: string;
  onSelect?: (lessonId: string) => void;
  compact?: boolean;
};

export function LessonList({
  items,
  currentLessonId,
  onSelect,
  compact = false,
}: LessonListProps) {
  return (
    <div className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200/60 bg-white shadow-sm">
      {items.map((lesson, index) => {
        const isCurrent = currentLessonId === lesson.id;
        const className = [
          "block w-full px-5 text-right transition sm:px-6",
          compact ? "py-4" : "py-5",
          isCurrent
            ? "bg-emerald-50 text-emerald-950"
            : "bg-white text-stone-800 hover:bg-[#fafbf8]",
        ].join(" ");

        const content = (
          <>
            <div className="flex items-start gap-3">
              {lesson.imageSources?.length ? (
                <span className="relative mt-1 aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-stone-100">
                  <FallbackImage
                    sources={lesson.imageSources}
                    alt={`صورة ${lesson.title}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </span>
              ) : null}
              <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-sm font-bold text-gray-600">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-base font-bold leading-8 sm:text-lg">
                  {lesson.title}
                </span>
                {lesson.section || lesson.bookTitle || lesson.sheikhName ? (
                  <span className="mt-0.5 block text-sm leading-7 text-gray-600 sm:text-base">
                    {[lesson.section, lesson.bookTitle, lesson.sheikhName]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                ) : null}
              </span>
            </div>
          </>
        );

        if (onSelect) {
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => onSelect(lesson.id)}
              className={className}
            >
              {content}
            </button>
          );
        }

        return lesson.href ? (
          <Link key={lesson.id} href={lesson.href} className={className}>
            {content}
          </Link>
        ) : (
          <div key={lesson.id} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
