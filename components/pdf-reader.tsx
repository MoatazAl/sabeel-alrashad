"use client";

import Link from "next/link";
import { ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type PdfReaderProps = {
  fileUrl: string;
  title: string;
};

type PdfJsEventBus = {
  on: (eventName: string, listener: (event?: { message?: string }) => void) => void;
  off: (eventName: string, listener: (event?: { message?: string }) => void) => void;
};

type PdfJsViewerApplication = {
  initializedPromise: Promise<void>;
  eventBus: PdfJsEventBus;
  pdfDocument: unknown | null;
};

type PdfJsViewerWindow = Window & {
  PDFViewerApplication?: PdfJsViewerApplication;
  SABEEL_PDFJS_STATUS?: "ready" | "error";
};

type ReaderStatus = "loading" | "ready" | "error";

type ReaderState = {
  viewerUrl: string;
  status: ReaderStatus;
};

const PDF_LOAD_TIMEOUT_MS = 45_000;

export function PdfReader({ fileUrl, title }: PdfReaderProps) {
  const readerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const connectViewerRef = useRef<(source: PdfJsViewerWindow) => void>(() => {});
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isFallbackFullscreen, setIsFallbackFullscreen] = useState(false);

  const viewerUrl = useMemo(
    () => `/pdfjs/web/viewer.html?file=${encodeURIComponent(fileUrl)}`,
    [fileUrl]
  );
  const [readerState, setReaderState] = useState<ReaderState>({
    viewerUrl,
    status: "loading",
  });
  const status =
    readerState.viewerUrl === viewerUrl ? readerState.status : "loading";
  const isFullscreen = isNativeFullscreen || isFallbackFullscreen;

  useEffect(() => {
    function handleFullscreenChange() {
      setIsNativeFullscreen(document.fullscreenElement === readerRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!isFallbackFullscreen) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFallbackFullscreen(false);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFallbackFullscreen]);

  useEffect(() => {
    let disposed = false;
    let detachViewerEvents: (() => void) | undefined;
    let connectedApplication: PdfJsViewerApplication | undefined;

    const timeoutId = setTimeout(() => {
      if (!disposed) setReaderState({ viewerUrl, status: "error" });
    }, PDF_LOAD_TIMEOUT_MS);

    function markReady() {
      if (disposed) return;
      clearTimeout(timeoutId);
      setReaderState({ viewerUrl, status: "ready" });
    }

    function markFailed() {
      if (disposed) return;
      clearTimeout(timeoutId);
      setReaderState({ viewerUrl, status: "error" });
    }

    async function connectViewer(source: PdfJsViewerWindow) {
      const application = source.PDFViewerApplication;
      if (!application || application === connectedApplication) return;
      connectedApplication = application;

      try {
        await application.initializedPromise;
        if (disposed) return;

        const handleDocumentLoaded = () => markReady();
        const handleDocumentError = () => markFailed();

        application.eventBus.on("documentloaded", handleDocumentLoaded);
        application.eventBus.on("documenterror", handleDocumentError);
        detachViewerEvents = () => {
          application.eventBus.off("documentloaded", handleDocumentLoaded);
          application.eventBus.off("documenterror", handleDocumentError);
        };

        // This also covers a cached document that finished before the parent
        // listener was attached.
        if (application.pdfDocument) markReady();
      } catch {
        markFailed();
      }
    }

    connectViewerRef.current = (source) => {
      void connectViewer(source);
    };

    function handleWebViewerLoaded(event: Event) {
      const source = (event as CustomEvent<{ source?: PdfJsViewerWindow }>).detail
        ?.source;

      if (source && source === frameRef.current?.contentWindow) {
        connectViewerRef.current(source);
      }
    }

    function handleViewerMessage(event: MessageEvent) {
      if (
        event.source !== frameRef.current?.contentWindow ||
        event.origin !== globalThis.location.origin ||
        event.data?.type !== "sabeel:pdfjs-status"
      ) {
        return;
      }

      if (event.data.status === "ready") markReady();
      if (event.data.status === "error") markFailed();
    }

    document.addEventListener("webviewerloaded", handleWebViewerLoaded);
    globalThis.addEventListener("message", handleViewerMessage);

    return () => {
      disposed = true;
      clearTimeout(timeoutId);
      detachViewerEvents?.();
      document.removeEventListener("webviewerloaded", handleWebViewerLoaded);
      globalThis.removeEventListener("message", handleViewerMessage);
      connectViewerRef.current = () => {};
    };
  }, [viewerUrl]);

  async function enterFullscreen() {
    const element = readerRef.current;
    if (!element) return;

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
        return;
      }
    } catch (error) {
      console.error("Failed to enter native PDF fullscreen:", error);
    }

    // iOS browsers have historically not exposed the element Fullscreen API.
    setIsFallbackFullscreen(true);
  }

  async function exitFullscreen() {
    if (isFallbackFullscreen) {
      setIsFallbackFullscreen(false);
      return;
    }

    if (!document.fullscreenElement) return;

    try {
      await document.exitFullscreen();
    } catch (error) {
      console.error("Failed to exit PDF fullscreen:", error);
    }
  }

  function handleFrameLoad() {
    const source = frameRef.current?.contentWindow as PdfJsViewerWindow | null;
    if (source?.SABEEL_PDFJS_STATUS === "ready") {
      setReaderState({ viewerUrl, status: "ready" });
    }
    if (source?.SABEEL_PDFJS_STATUS === "error") {
      setReaderState({ viewerUrl, status: "error" });
    }
    if (source?.PDFViewerApplication) connectViewerRef.current(source);
  }

  function handleFrameError() {
    setReaderState({ viewerUrl, status: "error" });
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
      </div>

      <div
        ref={readerRef}
        className={`pdf-reader-root flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-neutral-900 shadow-sm${
          isFallbackFullscreen ? " pdf-reader-fallback-fullscreen" : ""
        }`}
      >
        <div className="pdf-reader-toolbar relative z-20 flex h-12 shrink-0 items-center justify-end border-b border-white/10 bg-neutral-900 px-3">
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

        <div className="pdf-reader-viewport relative h-[calc(100dvh-180px)] min-h-[520px] w-full md:h-[calc(100vh-180px)] md:min-h-[750px]">
          <iframe
            ref={frameRef}
            src={viewerUrl}
            title={`قارئ ${title}`}
            allow="fullscreen"
            className="pdf-reader-frame h-full w-full border-0"
            loading="eager"
            onLoad={handleFrameLoad}
            onError={handleFrameError}
          />

          {status === "loading" ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900 text-white"
              role="status"
              aria-live="polite"
            >
              <div className="flex flex-col items-center gap-4">
                <span
                  className="h-10 w-10 animate-spin rounded-full border-4 border-white/25 border-t-teal-400"
                  aria-hidden="true"
                />
                <span className="font-bold">جارٍ تحميل الملف…</span>
              </div>
            </div>
          ) : null}

          {status === "error" ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900 p-6 text-center text-white"
              role="alert"
            >
              <div className="max-w-md">
                <h2 className="text-xl font-bold">تعذر عرض الملف داخل القارئ</h2>
                <p className="mt-3 leading-8 text-stone-300">
                  تحقق من اتصالك بالإنترنت، أو افتح الملف مباشرة كخيار بديل.
                </p>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-md bg-teal-700 px-5 py-3 font-bold text-white transition hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  فتح في نافذة جديدة
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
