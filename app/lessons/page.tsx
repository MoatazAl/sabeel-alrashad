import { LessonsCatalog } from "@/components/lessons-catalog";
import { books } from "@/data/library";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "السلاسل العلمية",
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
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <LessonsCatalog books={books} initialQuery={query} />
      </section>
    </main>
  );
}
