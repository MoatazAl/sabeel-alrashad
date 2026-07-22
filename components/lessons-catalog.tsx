"use client";

import { ArrowDownAZ, Clock3, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { BookCard } from "@/components/book-card";
import { filterBooks, normalizeBookTitle } from "@/lib/library";
import type { Book } from "@/lib/types";

type LessonsCatalogProps = {
  books: Book[];
  initialQuery?: string;
};

type CourseSort = "recent" | "alphabetical";

const arabicCollator = new Intl.Collator("ar", {
  sensitivity: "base",
  ignorePunctuation: true,
});

export function LessonsCatalog({
  books,
  initialQuery = "",
}: LessonsCatalogProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<CourseSort>("recent");

  const categories = useMemo(
    () => [...new Set(books.map((book) => book.category))].sort((a, b) =>
      arabicCollator.compare(a, b)
    ),
    [books]
  );
  const visibleBooks = useMemo(() => {
    const filteredBooks = filterBooks({
      query: query.trim(),
      category,
      status: "all",
      source: books,
    });

    if (sort === "alphabetical") {
      return [...filteredBooks].sort((a, b) =>
        arabicCollator.compare(
          normalizeBookTitle(a.title),
          normalizeBookTitle(b.title)
        )
      );
    }

    return filteredBooks;
  }, [books, category, query, sort]);

  const hasActiveFilters = Boolean(query.trim() || category);

  function resetFilters() {
    setQuery("");
    setCategory("");
    setSort("recent");
  }

  return (
    <div>
      <div className="mb-8 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(13rem,0.65fr)_minmax(15rem,0.8fr)]">
          <div>
            <label
              htmlFor="course-search"
              className="mb-2 block text-sm font-bold text-stone-700"
            >
              البحث في السلاسل
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                id="course-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="اسم السلسلة، الشيخ، المؤلف أو التصنيف..."
                className="min-h-14 w-full rounded-lg border border-stone-300 bg-stone-50 py-3 pe-4 ps-12 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:bg-white focus:ring-4 focus:ring-emerald-900/10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="course-category"
              className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-700"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              التصنيف
            </label>
            <select
              id="course-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-14 w-full rounded-lg border border-stone-300 bg-stone-50 px-4 text-base text-stone-900 outline-none transition focus:border-emerald-800 focus:bg-white focus:ring-4 focus:ring-emerald-900/10"
            >
              <option value="">كل التصنيفات</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="mb-2 block text-sm font-bold text-stone-700">
              ترتيب النتائج
            </legend>
            <div className="grid min-h-14 grid-cols-2 overflow-hidden rounded-lg border border-stone-300 bg-stone-50 p-1">
              <button
                type="button"
                onClick={() => setSort("recent")}
                aria-pressed={sort === "recent"}
                className={`inline-flex items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition sm:text-base ${
                  sort === "recent"
                    ? "bg-emerald-900 text-white shadow-sm"
                    : "text-stone-600 hover:bg-white"
                }`}
              >
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                آخر إضافة
              </button>
              <button
                type="button"
                onClick={() => setSort("alphabetical")}
                aria-pressed={sort === "alphabetical"}
                className={`inline-flex items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition sm:text-base ${
                  sort === "alphabetical"
                    ? "bg-emerald-900 text-white shadow-sm"
                    : "text-stone-600 hover:bg-white"
                }`}
              >
                <ArrowDownAZ className="h-4 w-4" aria-hidden="true" />
                أبجديًا
              </button>
            </div>
          </fieldset>
        </div>

        <div className="mt-4 flex min-h-9 flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4 text-sm text-stone-600">
          <p aria-live="polite">
            عرض <span className="font-bold text-stone-900">{visibleBooks.length}</span>{" "}
            من <span className="font-bold text-stone-900">{books.length}</span> سلسلة
          </p>
          {hasActiveFilters || sort !== "recent" ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 font-bold text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              مسح التصفية
            </button>
          ) : null}
        </div>
      </div>

      {visibleBooks.length > 0 ? (
        <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleBooks.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <h2 className="text-2xl font-bold text-stone-900">
            لا توجد سلاسل مطابقة
          </h2>
          <p className="mt-3 text-base leading-8 text-stone-500">
            جرّب اسمًا آخر أو اختر كل التصنيفات.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-lg bg-emerald-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            عرض جميع السلاسل
          </button>
        </div>
      )}
    </div>
  );
}
