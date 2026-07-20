import { books, sheikhs } from "@/data/library";
import type { Book, Lesson, Sheikh } from "@/lib/types";

export const categories = [
  "العقيدة",
  "الحديث",
  "مصطلح الحديث",
  "الفقه",
  "أصول الفقه",
  "التفسير",
  "اللغة العربية",
  "التزكية والآداب",
  "السياسة الشرعية",
  "الفكر والمنهج",
  "السيرة النبوية",
] as const;

export type LibraryLesson = {
  id: string;
  title: string;
  section?: string;
  href: string;
  book: Book;
  explainer?: Sheikh;
};

export function normalizeBookTitle(title: string) {
  return title
    .replace(/^شرح\s+/u, "")
    .replace(/^كتاب\s+/u, "")
    .replace(/^القراءة والتعليق على كتاب\s+/u, "")
    .replace(/^رسالة\s+/u, "")
    .trim();
}

export function getSheikhForBook(book: Book) {
  return sheikhs.find((sheikh) => sheikh.slug === book.explainerSlug);
}

export function getBookCategory(book: Book) {
  return book.category;
}

export function sortBooksByRecent(items: Book[]) {
  return [...items].sort((a, b) => {
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function organizeBooksBySeries(items: Book[]) {
  const series = new Map<
    string,
    { slug: string; title: string; books: Book[] }
  >();
  const standaloneBooks: Book[] = [];

  for (const book of items) {
    if (!book.seriesGroup) {
      standaloneBooks.push(book);
      continue;
    }

    const existingSeries = series.get(book.seriesGroup.slug);
    if (existingSeries) {
      existingSeries.books.push(book);
      continue;
    }

    series.set(book.seriesGroup.slug, {
      ...book.seriesGroup,
      books: [book],
    });
  }

  return {
    seriesGroups: [...series.values()],
    standaloneBooks,
  };
}

export function getRecentlyAddedBooks(limit = 6) {
  return sortBooksByRecent(books).slice(0, limit);
}

export function getLatestLessons(limit = 8): LibraryLesson[] {
  return sortBooksByRecent(books)
    .reduce<LibraryLesson[]>((lessons, book) => {
      const lesson = book.lessons.at(-1);
      if (!lesson) return lessons;

      lessons.push({
        id: lesson.id,
        title: lesson.title,
        section: lesson.section,
        href: `/books/${book.slug}?lesson=${lesson.id}`,
        book,
        explainer: getSheikhForBook(book),
      });

      return lessons;
    }, [])
    .slice(0, limit);
}

export function groupLessons(lessons: Lesson[]) {
  return lessons.reduce<Record<string, Lesson[]>>((groups, lesson) => {
    const key = lesson.section || "الدروس";
    groups[key] = groups[key] ?? [];
    groups[key].push(lesson);
    return groups;
  }, {});
}

export function filterBooks({
  query,
  category,
  explainerSlug,
  status,
  source = books,
}: {
  query?: string;
  category?: string;
  explainerSlug?: string;
  status?: "all" | "ongoing" | "completed";
  source?: Book[];
}) {
  const normalizedQuery = query?.trim();

  return sortBooksByRecent(source).filter((book) => {
    const bookStatus = book.status || "completed";
    const matchesQuery =
      !normalizedQuery ||
      book.title.includes(normalizedQuery) ||
      book.slug.includes(normalizedQuery) ||
      normalizeBookTitle(book.title).includes(normalizedQuery) ||
      book.authorName.includes(normalizedQuery) ||
      book.explainerName.includes(normalizedQuery) ||
      book.explainerSlug.includes(normalizedQuery) ||
      (book.description?.includes(normalizedQuery) ?? false) ||
      book.category.includes(normalizedQuery) ||
      (book.searchKeywords?.some((keyword) =>
        keyword.includes(normalizedQuery)
      ) ??
        false) ||
      book.lessons.some(
        (lesson) =>
          lesson.title.includes(normalizedQuery) ||
          (lesson.youtubeId?.includes(normalizedQuery) ?? false) ||
          (lesson.section?.includes(normalizedQuery) ?? false)
      );

    const matchesCategory = !category || category === getBookCategory(book);
    const matchesExplainer =
      !explainerSlug || explainerSlug === book.explainerSlug;
    const matchesStatus = !status || status === "all" || status === bookStatus;

    return matchesQuery && matchesCategory && matchesExplainer && matchesStatus;
  });
}

export function getAllLessons(limit?: number): LibraryLesson[] {
  const lessons = sortBooksByRecent(books).flatMap((book) =>
    book.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      section: lesson.section,
      href: `/books/${book.slug}?lesson=${lesson.id}`,
      book,
      explainer: getSheikhForBook(book),
    }))
  );

  return typeof limit === "number" ? lessons.slice(0, limit) : lessons;
}
