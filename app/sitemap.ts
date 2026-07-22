import type { MetadataRoute } from "next";
import { books, sheikhs } from "@/data/library";
import { itemTypeToRouteType, libraryItems } from "@/lib/library-items";
import { absoluteUrl, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    {
      url: absoluteUrl("/lessons"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/teachers"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/library"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/about"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/contact"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const coursePages: MetadataRoute.Sitemap = books.map((book) => ({
    url: absoluteUrl(`/books/${book.slug}`),
    lastModified: book.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const teacherPages: MetadataRoute.Sitemap = sheikhs.map((sheikh) => ({
    url: absoluteUrl(`/teachers/${sheikh.slug}`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const libraryPages: MetadataRoute.Sitemap = libraryItems.map((item) => ({
    url: absoluteUrl(
      `/library/${itemTypeToRouteType(item.type)}/${item.slug}`,
    ),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const pages = [
    ...staticPages,
    ...coursePages,
    ...teacherPages,
    ...libraryPages,
  ];

  return [...new Map(pages.map((page) => [page.url, page])).values()];
}
