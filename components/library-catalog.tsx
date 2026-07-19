"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookCard } from "@/components/book-card";
import { filterBooks } from "@/lib/library";
import type { Book } from "@/lib/types";

type LibraryCatalogProps = {
  books: Book[];
  category?: string;
  query?: string;
};

export function LibraryCatalog({
  books,
  category = "",
  query = "",
}: LibraryCatalogProps) {
  const [searchQuery, setSearchQuery] = useState(query);
  const normalizedQuery = searchQuery.trim();

  const filteredBooks = useMemo(
    () =>
      filterBooks({
        category,
        query: normalizedQuery,
        status: "all",
        source: books,
      }),
    [books, category, normalizedQuery]
  );

  return (
    <div>
      <div className="mx-auto mb-8 max-w-4xl rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <form
          onSubmit={(event) => event.preventDefault()}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label className="sr-only" htmlFor="library-live-search">
            البحث في المكتبة
          </label>
          <input
            id="library-live-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="ابحث باسم السلسلة أو الشيخ أو التصنيف..."
            className="min-h-16 flex-1 rounded-md border border-stone-300 bg-stone-50 px-5 text-right text-lg text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-teal-800 focus:bg-white focus:ring-4 focus:ring-teal-900/10"
          />
          <button
            type="submit"
            className="rounded-md bg-teal-800 px-8 py-3 text-base font-semibold text-white transition hover:bg-teal-900"
          >
            بحث
          </button>
        </form>

        {normalizedQuery ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-base text-stone-600">
            <p>
              عدد النتائج:{" "}
              <span className="font-semibold text-stone-900">
                {filteredBooks.length}
              </span>
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              مسح البحث
            </button>
          </div>
        ) : null}
        {category ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-base text-stone-600">
            <p>
              التصنيف المحدد:{" "}
              <span className="font-semibold text-stone-900">{category}</span>
            </p>
            <Link
              href="/library"
              className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              عرض كل التصنيفات
            </Link>
          </div>
        ) : null}
      </div>

      {filteredBooks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-12 text-center text-lg text-stone-600">
          <p className="text-2xl font-bold text-stone-900">
            لا توجد نتائج مطابقة
          </p>
          <p className="mt-3 text-base leading-8 text-stone-500">
            جرّب البحث باسم الشيخ أو عنوان السلسلة.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredBooks.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
