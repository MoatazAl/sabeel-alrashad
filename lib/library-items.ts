import {
  libraryAuthors,
  libraryItems,
  type LibraryItem,
  type LibraryItemType,
} from "@/data/library-items";

export type LibraryRouteType = "books" | "articles";

const arabicDiacritics = /[\u064B-\u065F\u0670]/g;

export function normalizeLibrarySearch(value: string) {
  return value
    .toLowerCase()
    .replace(arabicDiacritics, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

export function routeTypeToItemType(type: string): LibraryItemType | undefined {
  if (type === "books") return "book";
  if (type === "articles") return "article";
  return undefined;
}

export function itemTypeToRouteType(type: LibraryItemType): LibraryRouteType {
  return type === "book" ? "books" : "articles";
}

export function getLibraryTypeLabel(type: LibraryItemType) {
  return type === "book" ? "كتاب" : "مقالة أو رسالة";
}

export function getLibraryTypePluralLabel(type: LibraryRouteType) {
  return type === "books" ? "الكتب" : "المقالات والرسائل";
}

export function getLibraryItemHref(item: LibraryItem) {
  return `/library/${itemTypeToRouteType(item.type)}/${item.slug}`;
}

export function createDownloadUrl(fileUrl: string) {
  const url = new URL(fileUrl);
  url.searchParams.set("download", "1");
  return url.toString();
}

export function getLibraryItemsByType(type: LibraryItemType) {
  return libraryItems.filter((item) => item.type === type);
}

export function getLibraryCounts() {
  return {
    books: getLibraryItemsByType("book").length,
    articles: getLibraryItemsByType("article").length,
  };
}

export function getFeaturedLibraryBooks(limit = 4) {
  return libraryItems
    .filter((item) => item.type === "book" && item.featured)
    .slice(0, limit);
}

export function getLibraryItem(type: string, slug: string) {
  const itemType = routeTypeToItemType(type);
  if (!itemType) return undefined;

  return libraryItems.find(
    (item) => item.type === itemType && item.slug === slug
  );
}

export function filterLibraryItems({
  type,
  query = "",
  authorSlug = "",
}: {
  type: LibraryItemType;
  query?: string;
  authorSlug?: string;
}) {
  const normalizedQuery = normalizeLibrarySearch(query);

  return getLibraryItemsByType(type).filter((item) => {
    const searchableText = normalizeLibrarySearch(
      `${item.title} ${item.authorName}`
    );
    const matchesQuery =
      !normalizedQuery || searchableText.includes(normalizedQuery);
    const matchesAuthor = !authorSlug || item.authorSlug === authorSlug;

    return matchesQuery && matchesAuthor;
  });
}

export { libraryAuthors, libraryItems };
