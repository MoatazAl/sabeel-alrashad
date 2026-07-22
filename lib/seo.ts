import type { Metadata } from "next";
import type { LibraryItem } from "@/data/library-items";
import type { Book, Sheikh } from "@/lib/types";
import { getCourseCoverSources } from "@/lib/course-images";
import {
  DEFAULT_OPEN_GRAPH_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  createPageMetadata,
} from "@/lib/site";

function withoutHonorific(name: string) {
  return name.replace(/^فضيلة\s+/, "");
}

export function getCourseDescription(book: Book) {
  return (
    book.description ??
    `${book.title} في ${book.category}، في ${book.lessonsCount} دروس لفضيلة ${withoutHonorific(book.explainerName)}.`
  );
}

export function getCourseImage(book: Book) {
  return getCourseCoverSources(book)[0] ?? DEFAULT_OPEN_GRAPH_IMAGE;
}

export function createCourseMetadata(book: Book): Metadata {
  return {
    ...createPageMetadata({
      title: `${book.title} | ${withoutHonorific(book.explainerName)}`,
      description: getCourseDescription(book),
      path: `/books/${book.slug}`,
      image: getCourseImage(book),
    }),
    authors: [{ name: book.authorName }],
  };
}

export function createCourseJsonLd(book: Book) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: book.title,
    description: getCourseDescription(book),
    url: absoluteUrl(`/books/${book.slug}`),
    image: absoluteUrl(getCourseImage(book)),
    inLanguage: "ar",
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    instructor: {
      "@type": "Person",
      name: withoutHonorific(book.explainerName),
      url: absoluteUrl(`/teachers/${book.explainerSlug}`),
    },
    author: {
      "@type": "Person",
      name: book.authorName,
    },
  };
}

export function getTeacherDescription(sheikh: Sheikh) {
  return `السلاسل العلمية والكتب والمقالات لفضيلة ${sheikh.name} على موقع سبيل الرشاد.`;
}

export function createTeacherMetadata(sheikh: Sheikh): Metadata {
  return createPageMetadata({
    title: `${sheikh.name} | الدروس والكتب والمقالات`,
    description: getTeacherDescription(sheikh),
    path: `/teachers/${sheikh.slug}`,
    appendSiteName: false,
  });
}

export function createPersonJsonLd(sheikh: Sheikh) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: sheikh.name,
    description: getTeacherDescription(sheikh),
    url: absoluteUrl(`/teachers/${sheikh.slug}`),
  };
}

export function getPublicationDescription(item: LibraryItem) {
  const itemLabel = item.type === "book" ? "كتاب" : "مقال أو رسالة";
  return (
    item.description ??
    `${itemLabel} ${item.title} للمؤلف ${item.authorName}، متاح للقراءة في مكتبة سبيل الرشاد.`
  );
}

export function createPublicationMetadata(item: LibraryItem): Metadata {
  return createPageMetadata({
    title: item.title,
    description: getPublicationDescription(item),
    path: `/library/${item.type === "book" ? "books" : "articles"}/${item.slug}`,
    image: item.coverImage ?? DEFAULT_OPEN_GRAPH_IMAGE,
  });
}

export function createPublicationJsonLd(item: LibraryItem) {
  const pageUrl = absoluteUrl(
    `/library/${item.type === "book" ? "books" : "articles"}/${item.slug}`,
  );
  const common = {
    "@context": "https://schema.org",
    name: item.title,
    description: getPublicationDescription(item),
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    image: absoluteUrl(item.coverImage ?? DEFAULT_OPEN_GRAPH_IMAGE),
    inLanguage: "ar",
    isAccessibleForFree: true,
    author: {
      "@type": "Person",
      name: item.authorName,
    },
  };

  if (item.type === "book") {
    return {
      ...common,
      "@type": "Book",
    };
  }

  return {
    ...common,
    "@type": "Article",
    headline: item.title,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
