import { BookCard } from "@/components/book-card";
import { organizeBooksBySeries } from "@/lib/library";
import type { Book } from "@/lib/types";

type BookSeriesCollectionProps = {
  books: Book[];
  headingLevel?: 2 | 3;
};

export function BookSeriesCollection({
  books,
  headingLevel = 2,
}: BookSeriesCollectionProps) {
  const { seriesGroups, standaloneBooks } = organizeBooksBySeries(books);
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <div className="space-y-10">
      {seriesGroups.map((series) => {
        const headingId = `course-series-${series.slug}`;

        return (
          <section key={series.slug} aria-labelledby={headingId}>
            <Heading
              id={headingId}
              className="mb-5 border-s-4 border-amber-600 ps-4 text-2xl font-bold text-stone-950"
            >
              {series.title}
            </Heading>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {series.books.map((book) => (
                <BookCard key={book.slug} book={book} />
              ))}
            </div>
          </section>
        );
      })}

      {standaloneBooks.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {standaloneBooks.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
