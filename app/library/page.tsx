import Link from "next/link";
import { LibraryItemCard } from "@/components/library-item-card";
import {
  filterLibraryItems,
  getLibraryCounts,
  getLibraryTypePluralLabel,
  libraryAuthors,
  type LibraryRouteType,
  routeTypeToItemType,
} from "@/lib/library-items";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "المكتبة",
  description:
    "مكتبة سبيل الرشاد للكتب والمقالات والرسائل العلمية الشرعية، متاحة للقراءة والتصفح.",
  path: "/library",
});

type LibraryPageProps = {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    author?: string;
  }>;
};

const tabs: { type: LibraryRouteType; label: string }[] = [
  { type: "books", label: "الكتب" },
  { type: "articles", label: "المقالات والرسائل" },
];

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const activeTab: LibraryRouteType =
    params.tab === "articles" ? "articles" : "books";
  const activeItemType = routeTypeToItemType(activeTab) ?? "book";
  const query = params.q?.trim() ?? "";
  const authorSlug = params.author ?? "";
  const counts = getLibraryCounts();
  const items = filterLibraryItems({
    type: activeItemType,
    query,
    authorSlug,
  });

  return (
    <main>
      <section className="border-b border-stone-200 bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <nav className="mb-5 text-sm font-semibold text-stone-500">
            <Link href="/" className="hover:text-teal-800">
              الرئيسية
            </Link>
            <span className="mx-2">←</span>
            <span className="text-stone-800">المكتبة</span>
            <span className="mx-2">←</span>
            <span className="text-stone-800">
              {getLibraryTypePluralLabel(activeTab)}
            </span>
          </nav>
          <h1 className="text-4xl font-bold leading-tight text-stone-950 md:text-5xl">
            مكتبة سبيل الرشاد
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-9 text-stone-600">
            كتب ومقالات ورسائل علمية لفضيلة المشايخ، بروابط مباشرة من
            التخزين السحابي دون نسخ محلية للملفات.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.type;
            const count = tab.type === "books" ? counts.books : counts.articles;

            return (
              <Link
                key={tab.type}
                href={`/library?tab=${tab.type}`}
                className={[
                  "rounded-full border px-5 py-2.5 text-base font-bold transition",
                  isActive
                    ? "border-teal-800 bg-teal-800 text-white"
                    : "border-stone-200 bg-white text-stone-700 hover:border-teal-800 hover:text-teal-900",
                ].join(" ")}
              >
                {tab.label}
                <span className="mr-2 rounded-full bg-white/20 px-2 py-0.5 text-sm">
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mb-8 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <form action="/library" className="grid gap-3 lg:grid-cols-[1fr_260px_auto]">
            <input type="hidden" name="tab" value={activeTab} />
            <label className="sr-only" htmlFor="document-library-search">
              البحث في مكتبة الكتب والمقالات
            </label>
            <input
              id="document-library-search"
              name="q"
              defaultValue={query}
              placeholder="ابحث بالعنوان العربي أو اسم المؤلف..."
              className="min-h-14 rounded-md border border-stone-300 bg-stone-50 px-5 text-right text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-teal-800 focus:bg-white focus:ring-4 focus:ring-teal-900/10"
            />
            <label className="sr-only" htmlFor="document-library-author">
              تصفية حسب المؤلف
            </label>
            <select
              id="document-library-author"
              name="author"
              defaultValue={authorSlug}
              className="min-h-14 rounded-md border border-stone-300 bg-stone-50 px-4 text-right text-base font-semibold text-stone-800 outline-none transition focus:border-teal-800 focus:bg-white focus:ring-4 focus:ring-teal-900/10"
            >
              <option value="">كل المؤلفين</option>
              {libraryAuthors.map((author) => (
                <option key={author.slug} value={author.slug}>
                  {author.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md bg-teal-800 px-8 py-3 text-base font-semibold text-white transition hover:bg-teal-900"
            >
              بحث
            </button>
          </form>

          {query || authorSlug ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-base text-stone-600">
              <p>
                عدد النتائج:{" "}
                <span className="font-semibold text-stone-900">
                  {items.length}
                </span>
              </p>
              <Link
                href={`/library?tab=${activeTab}`}
                className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                مسح التصفية
              </Link>
            </div>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-12 text-center text-lg text-stone-600">
            <p className="text-2xl font-bold text-stone-900">
              لا توجد نتائج مطابقة
            </p>
            <p className="mt-3 text-base leading-8 text-stone-500">
              جرّب البحث بعنوان آخر أو اختر كل المؤلفين.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <LibraryItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
