import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Library,
} from "lucide-react";
import { BookCard } from "@/components/book-card";
import { DocumentCover } from "@/components/document-cover";
import { SearchBar } from "@/components/search-bar";
import { TeacherCard } from "@/components/teacher-card";
import { sheikhs } from "@/data/library";
import {
  getFeaturedLibraryBooks,
  getLibraryCounts,
  getLibraryItemHref,
} from "@/lib/library-items";
import { getRecentlyAddedBooks } from "@/lib/library";

function SectionHeader({
  id,
  title,
  href,
  description,
  eyebrow,
}: {
  id: string;
  title: string;
  href?: string;
  description?: string;
  eyebrow?: string;
}) {
  return (
    <header className="mb-8 flex items-end justify-between gap-6">
      <div className="border-s-4 border-emerald-800 ps-4">
        {eyebrow ? (
          <p className="mb-1.5 text-sm font-semibold text-emerald-700">{eyebrow}</p>
        ) : null}
        <h2
          id={id}
          className="text-xl font-bold tracking-tight text-gray-800 sm:text-2xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 sm:text-base"
        >
          عرض الكل
          <ArrowLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </header>
  );
}
export default function HomePage() {
  const recentBooks = getRecentlyAddedBooks(6);
  const featuredLibraryBooks = getFeaturedLibraryBooks(4);
  const libraryCounts = getLibraryCounts();

  return (
    <main className="bg-[#fdfbf7]">
      <section className="border-b border-stone-200/80">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center rounded-full border border-emerald-900/10 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900">
              مكتبة لطلاب العلم في فلسطين
            </div>

            <h1 className="mt-7 text-3xl font-extrabold leading-relaxed tracking-tight text-gray-800 sm:text-4xl">
              مواد علمية مختارة من دروس المشايخ وكتبهم ومقالاتهم.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-relaxed text-gray-600 sm:text-lg">
              للاستماع والقراءة والتحميل.
            </p>

            <div className="mx-auto mt-8 max-w-2xl text-start">
              <SearchBar
                action="/lessons"
                placeholder="ابحث باسم السلسلة أو الشيخ أو التصنيف..."
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-20 sm:px-6 lg:px-8">
        <section aria-labelledby="teachers-heading">
          <SectionHeader
            id="teachers-heading"
            eyebrow="أهل العلم"
            title="الشيوخ"
            description="تصفح السلاسل والدروس بحسب الشيخ، وانتقل مباشرة إلى مواده العلمية."
            href="/teachers"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {sheikhs.map((sheikh) => (
              <TeacherCard key={sheikh.slug} sheikh={sheikh} />
            ))}
          </div>
        </section>

        <section
          aria-labelledby="library-heading"
          className="rounded-xl border border-emerald-900/10 bg-emerald-50/40 p-5 sm:p-8 lg:p-10"
        >
          <SectionHeader
            id="library-heading"
            eyebrow="للقراءة والتحميل"
            title="مكتبة سبيل الرشاد"
            href="/library"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/library?tab=books"
              className="group flex items-center gap-4 rounded-xl border border-stone-200/60 bg-white p-5 shadow-sm transition hover:border-emerald-800/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-gray-600">
                  الكتب
                </span>
                <span className="mt-0.5 block text-2xl font-extrabold text-gray-800">
                  {libraryCounts.books} كتب
                </span>
              </span>
              <ArrowLeft
                className="ms-auto h-5 w-5 text-stone-300 transition group-hover:-translate-x-1 group-hover:text-emerald-800"
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/library?tab=articles"
              className="group flex items-center gap-4 rounded-xl border border-stone-200/60 bg-white p-5 shadow-sm transition hover:border-emerald-800/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-gray-600">
                  المقالات والرسائل
                </span>
                <span className="mt-0.5 block text-2xl font-extrabold text-gray-800">
                  {libraryCounts.articles} مادة
                </span>
              </span>
              <ArrowLeft
                className="ms-auto h-5 w-5 text-stone-300 transition group-hover:-translate-x-1 group-hover:text-emerald-800"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featuredLibraryBooks.map((item) => (
              <Link
                key={item.id}
                href={getLibraryItemHref(item)}
                className="group overflow-hidden rounded-xl border border-stone-200/60 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-800/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
              >
                <DocumentCover item={item} compact />
                <div className="px-2 pb-2 pt-4">
                  <span className="inline-flex rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    كتاب
                  </span>
                  <h3 className="mt-2 text-lg font-bold leading-8 text-gray-800">
                    {item.title}
                  </h3>
                  {item.edition ? (
                    <p className="mt-1 text-sm text-gray-600">{item.edition}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/library"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 sm:text-base"
          >
            <Library className="h-4 w-4" aria-hidden="true" />
            عرض المكتبة كاملة
          </Link>
        </section>

        <section aria-labelledby="recent-heading">
          <SectionHeader
            id="recent-heading"
            eyebrow="جديد المنصة"
            title="أضيف حديثاً"
            description="أحدث السلاسل والمواد التي أضيفت إلى المكتبة."
            href="/lessons"
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recentBooks.map((book) => (
              <BookCard key={book.slug} book={book} />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
