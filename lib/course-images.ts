import type { Book, Lesson } from "@/lib/types";
import { extractVideoId } from "@/lib/youtube";

const YOUTUBE_IMAGE_HOSTNAMES = new Set(["i.ytimg.com", "img.youtube.com"]);

function uniqueSources(sources: Array<string | undefined>) {
  return sources.filter(
    (source, index, allSources): source is string =>
      Boolean(source) && allSources.indexOf(source) === index
  );
}

function isYouTubeThumbnailUrl(source: string | undefined) {
  if (!source) return false;

  try {
    return YOUTUBE_IMAGE_HOSTNAMES.has(new URL(source).hostname);
  } catch {
    return false;
  }
}

function getHqDefaultFallback(source: string | undefined) {
  if (!source || !isYouTubeThumbnailUrl(source)) return undefined;

  try {
    const url = new URL(source);
    const videoPath = url.pathname.match(/^\/vi(?:_webp)?\/([^/]+)\//);
    if (!videoPath) return undefined;

    return `https://i.ytimg.com/vi/${videoPath[1]}/hqdefault.jpg`;
  } catch {
    return undefined;
  }
}

function withYouTubeFallback(source: string | undefined) {
  return uniqueSources([source, getHqDefaultFallback(source)]);
}

function getLessonVideoId(lesson: Lesson) {
  return lesson.youtubeId ??
    (lesson.youtubeUrl ? extractVideoId(lesson.youtubeUrl) : null);
}

export function getYouTubeLessonThumbnailSources(lesson: Lesson) {
  const videoId = getLessonVideoId(lesson);

  if (!videoId) {
    return uniqueSources([lesson.image, lesson.coverImage]);
  }

  return uniqueSources([
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    lesson.image,
    lesson.coverImage,
  ]);
}

export function getCourseCoverSources(book: Book) {
  if (book.source !== "youtube") {
    return uniqueSources([book.coverImage]);
  }

  const youtubeDataThumbnail = [book.coverImage, book.cover].find(
    isYouTubeThumbnailUrl
  );
  const firstYouTubeLesson = book.lessons.find(
    (lesson) => lesson.youtubeId || lesson.youtubeUrl
  );
  const lessonThumbnailSources = firstYouTubeLesson
    ? getYouTubeLessonThumbnailSources(firstYouTubeLesson)
    : [];
  const firstVideoThumbnails = lessonThumbnailSources[1]
    ? [lessonThumbnailSources[1], ...lessonThumbnailSources.slice(2)]
    : lessonThumbnailSources;
  const localFallbacks = [book.coverImage, book.cover].filter(
    (source) => source && !isYouTubeThumbnailUrl(source)
  );

  return uniqueSources([
    ...withYouTubeFallback(book.playlistThumbnailUrl),
    ...withYouTubeFallback(youtubeDataThumbnail),
    ...firstVideoThumbnails,
    ...localFallbacks,
  ]);
}
