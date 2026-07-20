import { TeacherCard } from "@/components/teacher-card";
import { sheikhs } from "@/data/library";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "الشيوخ",
  description:
    "تصفح صفحات الشيوخ ودروسهم وسلاسلهم الصوتية وكتبهم ومقالاتهم في سبيل الرشاد.",
  path: "/teachers",
});

export default function TeachersPage() {
  return (
    <main>
      <section className="border-b border-stone-200 bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="text-4xl font-bold text-stone-950 md:text-5xl">الشيوخ</h1>
          <p className="mt-5 max-w-2xl text-lg leading-9 text-stone-600">
            اختر شيخاً لتصفح سلاسله ودروسه الصوتية وكتبه ومقالاته ورسائله.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {sheikhs.map((sheikh) => (
            <TeacherCard key={sheikh.slug} sheikh={sheikh} />
          ))}
        </div>
      </section>
    </main>
  );
}
