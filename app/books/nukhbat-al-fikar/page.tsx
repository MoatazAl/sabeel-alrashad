import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { RecordingCoursePlayer } from "@/components/recording-course-player";
import { books } from "@/data/library";
import { createCourseJsonLd, createCourseMetadata } from "@/lib/seo";

const nukhbatAlFikar = books.find((item) => item.slug === "nukhbat-al-fikar");

export const metadata = nukhbatAlFikar
  ? createCourseMetadata(nukhbatAlFikar)
  : {};

type NukhbatAlFikarPageProps = {
  searchParams: Promise<{ lesson?: string }>;
};

export default async function NukhbatAlFikarPage({
  searchParams,
}: NukhbatAlFikarPageProps) {
  const { lesson } = await searchParams;
  const book = nukhbatAlFikar;

  if (!book) return notFound();

  return (
    <main dir="rtl">
      <JsonLd data={createCourseJsonLd(book)} />
      <section className="border-b border-stone-200 bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div>
            <div className="flex flex-wrap gap-2 text-sm font-medium">
              <span className="rounded-full border border-teal-900/15 bg-teal-50 px-3 py-1 text-teal-900">
                تسجيل صوتي
              </span>
              <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-stone-600">
                {book.lessonsCount} درسا
              </span>
            </div>
            <p className="mt-4 text-4xl font-bold leading-tight text-stone-950 md:text-5xl">
              {book.title}
            </p>
            <p className="mt-4 text-xl font-semibold text-stone-700">
              {book.explainerName}
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-9 text-stone-600">
              {book.description}
            </p>
            <Link
              href={`/teachers/${book.explainerSlug}`}
              className="mt-7 inline-flex rounded-md border border-stone-300 bg-white px-5 py-2.5 text-base font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              العودة إلى صفحة الشيخ
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <RecordingCoursePlayer book={book} initialLessonId={lesson} />
      </section>
    </main>
  );
}
