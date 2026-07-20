import { BookCard } from "@/components/book-card";
import { SearchBar } from "@/components/search-bar";
import { books } from "@/data/library";
import { filterBooks } from "@/lib/library";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "السلاسل العلمية والدروس",
  description:
    "تصفح السلاسل العلمية والدروس الإسلامية والدورات الصوتية المرتبة حسب الشيخ والتصنيف في سبيل الرشاد.",
  path: "/lessons",
});

type LessonsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function LessonsPage({ searchParams }: LessonsPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const playlists = filterBooks({
    query,
    status: "all",
    source: books,
  });

  return (
    <main>
      <section className="border-b border-stone-200 bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="text-4xl font-bold text-stone-950 md:text-5xl">
            السلاسل العلمية
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-9 text-stone-600">
            تصفح الدروس ضمن سلاسلها الكاملة، ثم افتح السلسلة للوصول إلى
            قائمة دروسها.
          </p>
          <div className="mt-8">
            <SearchBar
              action="/lessons"
              defaultValue={query}
              placeholder="ابحث باسم السلسلة أو الشيخ أو التصنيف..."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {playlists.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {playlists.map((book) => (
              <BookCard key={book.slug} book={book} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <h2 className="text-2xl font-bold text-stone-900">
              لا توجد سلاسل مطابقة
            </h2>
            <p className="mt-3 text-base leading-8 text-stone-500">
              جرّب البحث باسم آخر أو باسم الشيخ.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
