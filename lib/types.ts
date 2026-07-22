export type Sheikh = {
  slug: string;
  name: string;
  bio: string;
  authorSlug?: string;
};

export type Lesson = {
  id: string;
  number?: number;
  title: string;
  youtubeUrl?: string;
  youtubeId?: string;
  audioUrl?: string;
  image?: string;
  coverImage?: string;
  startAt?: number;
  duration?: string;
  section?: string;
};

export type BookSeriesGroup = {
  slug: string;
  title: string;
};

export type Book = {
  slug: string;
  title: string;
  authorName: string;
  explainerName: string;
  explainerSlug: string;
  sheikhSlug?: string;
  category: string;
  lessonsCount: number;
  type?: "video" | "audio";
  source?: "youtube" | "r2" | "direct";
  lessons: Lesson[];
  searchKeywords?: string[];
  updatedAt?: string; // e.g. "2026-04-16"
  status?: "ongoing" | "completed";
  description?: string;
  cover?: string;
  coverImage?: string;
  playlistThumbnailUrl?: string;
  imageFit?: "cover" | "contain";
  imagePosition?: string;
  coverFrame?: "dark";
  seriesGroup?: BookSeriesGroup;
};
