import { notFound } from "next/navigation";
import Link from "next/link";
import { RecordingCoursePlayer } from "@/components/recording-course-player";
import { books } from "@/data/library";

type TadmuriyyahPageProps = {
  searchParams: Promise<{ lesson?: string }>;
};

export default async function TadmuriyyahPage({
  searchParams,
}: TadmuriyyahPageProps) {
  const { lesson } = await searchParams;
  const book = books.find((item) => item.slug === "al-fatwa-al-tadmuriyyah");

  if (!book) return notFound();

  return (
    <main dir="rtl" className="book-page">
      <section className="border-b border-[#e2d4b9] bg-[#fbf4e6]/80">
        <div className="mx-auto max-w-[1220px] px-4 py-10 sm:px-6 lg:py-12">
          <div>
            <div className="flex flex-wrap gap-2 text-sm font-medium">
              <span className="rounded-full border border-emerald-900/15 bg-emerald-50 px-3 py-1 text-emerald-950">
                تسجيل صوتي
              </span>
              <span className="rounded-full border border-amber-200 bg-white/75 px-3 py-1 text-stone-700">
                {book.lessonsCount} درسا
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-black leading-tight text-emerald-950 md:text-5xl">
              {book.title}
            </h1>
            <p className="mt-3 text-xl font-bold text-stone-800">
              {book.explainerName}
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-9 text-stone-700">
              {book.description}
            </p>
            <Link
              href={`/teachers/${book.explainerSlug}`}
              className="mt-6 inline-flex rounded-full border border-[#d8c59d] bg-[#fffdf7] px-5 py-2.5 text-base font-bold text-stone-800 shadow-sm transition hover:border-emerald-800/30 hover:bg-[#fff8e8]"
            >
              العودة إلى صفحة الشيخ
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-4 py-8 sm:px-6 lg:py-12">
        <RecordingCoursePlayer book={book} initialLessonId={lesson} />
      </section>
    </main>
  );
}
