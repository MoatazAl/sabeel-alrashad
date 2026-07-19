"use client";

import Link from "next/link";
import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type PdfReaderProps = {
  fileUrl: string;
  title: string;
};

export function PdfReader({ fileUrl, title }: PdfReaderProps) {
  const readerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === readerRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  async function enterFullscreen() {
    const element = readerRef.current;

    if (!element) {
      return;
    }

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to enter PDF fullscreen:", error);
    }
  }

  async function exitFullscreen() {
    if (!document.fullscreenElement) {
      return;
    }

    try {
      await document.exitFullscreen();
    } catch (error) {
      console.error("Failed to exit PDF fullscreen:", error);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1500px] px-2 sm:px-4" dir="rtl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href="/library"
          className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-teal-800 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
        >
          العودة إلى المكتبة
        </Link>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-teal-800 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
        >
          فتح في نافذة جديدة
        </a>
      </div>

      <div
        ref={readerRef}
        className="pdf-reader-root flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-neutral-900 shadow-sm"
      >
        <div className="pdf-reader-toolbar relative z-10 flex h-12 shrink-0 items-center justify-end border-b border-white/10 bg-neutral-900 px-3">
          <button
            type="button"
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            aria-label={isFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"}
            className="inline-flex items-center gap-2 rounded-md bg-teal-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            )}
            {isFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"}
          </button>
        </div>
        <iframe
          src={fileUrl}
          title={title}
          allowFullScreen
          className="pdf-reader-frame h-[calc(100dvh-180px)] min-h-[650px] w-full border-0 md:h-[calc(100vh-180px)] md:min-h-[750px]"
          loading="eager"
        />
      </div>

      <p className="mt-3 text-sm text-stone-600">
        إذا تعذر عرض الملف داخل الصفحة، افتحه في نافذة جديدة.
      </p>
    </section>
  );
}
