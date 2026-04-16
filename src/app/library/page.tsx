"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { seriesList, sheikhs } from "@/data/library";

export default function LibraryPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return seriesList;

    return seriesList.filter((item) => {
      const sheikh = sheikhs.find((s) => s.slug === item.sheikhSlug);
      return (
        item.title.includes(q) ||
        item.description.includes(q) ||
        sheikh?.name.includes(q)
      );
    });
  }, [query]);

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-3xl font-bold">المكتبة</h1>
        <p className="mt-3 max-w-2xl leading-8 text-stone-600">
          تصفّح السلاسل العلمية وقوائم التشغيل، أو ابحث باسم الشيخ أو السلسلة.
        </p>

        <div className="mt-8">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم الشيخ أو السلسلة"
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base outline-none ring-0 placeholder:text-stone-400"
          />
        </div>

        <div className="mt-8 grid gap-4">
          {filtered.map((item) => {
            const sheikh = sheikhs.find((s) => s.slug === item.sheikhSlug);

            return (
              <Link
                key={item.slug}
                href={`/series/${item.slug}`}
                className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:bg-stone-50"
              >
                <div className="text-sm text-stone-500">{sheikh?.name}</div>
                <h2 className="mt-1 text-xl font-semibold">{item.title}</h2>
                <p className="mt-2 leading-8 text-stone-600">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}