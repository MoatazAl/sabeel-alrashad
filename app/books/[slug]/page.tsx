import { notFound } from "next/navigation";
import { BookPlaylist } from "@/components/book-playlist";
import { books } from "@/data/library";

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

export default async function BookPage({
  params,
  searchParams,
}: BookPageProps) {
  const { slug } = await params;
  const { lesson } = await searchParams;
  const book = books.find((item) => item.slug === slug);

  if (!book) return notFound();

  return (
    <main>
      <section className="border-b border-stone-200 bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap gap-2 text-sm font-medium">
            <span className="rounded-full border border-teal-900/15 bg-teal-50 px-3 py-1 text-teal-900">
              {book.category}
            </span>
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-stone-600">
              {book.status === "ongoing" ? "سلسلة مستمرة" : "سلسلة مكتملة"}
            </span>
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-stone-950 md:text-5xl">
            {book.title}
          </h1>
          <p className="mt-4 text-lg leading-9 text-stone-600">
            الشارح: {book.explainerName} · المؤلف: {book.authorName}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <BookPlaylist book={book} initialLessonId={lesson} />
      </section>
    </main>
  );
}
