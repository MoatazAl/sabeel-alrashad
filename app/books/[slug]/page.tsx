import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookCard } from "@/components/book-card";
import { BookPlaylist } from "@/components/book-playlist";
import { FallbackImage } from "@/components/fallback-image";
import { JsonLd } from "@/components/json-ld";
import { books } from "@/data/library";
import { getCourseCoverSources } from "@/lib/course-images";
import { sortBooksByRecent } from "@/lib/library";
import { createCourseJsonLd, createCourseMetadata } from "@/lib/seo";

type BookPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
};

export function generateStaticParams() {
  const customAudioSeriesSlugs = [
    "al-fatwa-al-tadmuriyyah",
    "nukhbat-al-fikar",
  ];

  return books
    .filter((book) => !customAudioSeriesSlugs.includes(book.slug))
    .map((book) => ({
      slug: book.slug,
    }));
}

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = books.find((item) => item.slug === slug);

  if (!book) return {};

  return createCourseMetadata(book);
}

export default async function BookPage({
  params,
  searchParams,
}: BookPageProps) {
  const { slug } = await params;
  const { lesson } = await searchParams;
  const book = books.find((item) => item.slug === slug);

  if (!book) return notFound();

  const relatedCourses = book.seriesGroup
    ? sortBooksByRecent(
        books.filter(
          (item) =>
            item.slug !== book.slug &&
            item.seriesGroup?.slug === book.seriesGroup?.slug,
        ),
      )
    : [];
  const courseCoverSources = getCourseCoverSources(book);

  return (
    <main>
      <JsonLd data={createCourseJsonLd(book)} />
      <section className="border-b border-stone-200 bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div
            className={
              book.source === "youtube" && courseCoverSources.length > 0
                ? "grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px]"
                : undefined
            }
          >
            <div>
              <div className="flex flex-wrap gap-2 text-sm font-medium">
                <span className="rounded-full border border-teal-900/15 bg-teal-50 px-3 py-1 text-teal-900">
                  {book.category}
                </span>
                <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-stone-600">
                  {book.status === "ongoing" ? "سلسلة مستمرة" : "سلسلة مكتملة"}
                </span>
              </div>
              <p className="mt-5 text-4xl font-bold leading-tight text-stone-950 md:text-5xl">
                {book.title}
              </p>
              <p className="mt-4 text-lg leading-9 text-stone-600">
                الشارح: {book.explainerName} · المؤلف: {book.authorName}
              </p>
            </div>

            {book.source === "youtube" && courseCoverSources.length > 0 ? (
              <div className="relative aspect-video overflow-hidden rounded-lg bg-stone-100 shadow-sm">
                <FallbackImage
                  sources={courseCoverSources}
                  alt={`صورة سلسلة ${book.title}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 420px, 100vw"
                  className="object-cover"
                  style={{
                    objectPosition: book.imagePosition ?? "center",
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <BookPlaylist book={book} initialLessonId={lesson} />
      </section>

      {relatedCourses.length > 0 ? (
        <section className="border-t border-stone-200 bg-[#fbfaf7]">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <h2 className="mb-6 text-2xl font-bold text-stone-950">
              من {book.seriesGroup?.title}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedCourses.map((course) => (
                <BookCard key={course.slug} book={course} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
