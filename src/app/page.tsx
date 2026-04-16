import Link from "next/link";
import { BookOpen, Search, Library } from "lucide-react";
import { sheikhs, seriesList } from "@/data/library";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm md:p-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700">
            <BookOpen size={16} />
            <span>منصة بسيطة لطلاب العلم</span>
          </div>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            سبيل الرشاد
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-9 text-stone-600">
            موقع يجمع السلاسل العلمية وقوائم التشغيل للمشايخ، مع تنظيم واضح بحسب الشيخ والسلسلة،
            حتى يسهل على طالب العلم الوصول للدرس والمتابعة دون تشتت.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/library"
              className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              دخول المكتبة
            </Link>

            <a
              href="https://youtube.com/channel/UCFkDxJ9JRhxXTZoZEHno53g?si=jOqVmr11Qf9d9wUl"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              فتح القناة الأصلية
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">المشايخ</h2>
          <div className="text-sm text-stone-500">{sheikhs.length} مشايخ</div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {sheikhs.map((sheikh) => {
            const count = seriesList.filter((s) => s.sheikhSlug === sheikh.slug).length;

            return (
              <Link
                key={sheikh.slug}
                href={`/sheikhs/${sheikh.slug}`}
                className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100">
                  <Library size={20} />
                </div>

                <h3 className="text-xl font-semibold">{sheikh.name}</h3>
                <p className="mt-3 leading-8 text-stone-600">{sheikh.bio}</p>
                <div className="mt-4 text-sm text-stone-500">{count} سلاسل</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <Search size={20} className="mb-3" />
            <h3 className="text-lg font-semibold">بحث سريع</h3>
            <p className="mt-2 leading-8 text-stone-600">
              ابحث باسم الشيخ أو السلسلة من صفحة المكتبة.
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <BookOpen size={20} className="mb-3" />
            <h3 className="text-lg font-semibold">تنظيم أوضح</h3>
            <p className="mt-2 leading-8 text-stone-600">
              بدل التشتت بين القنوات والروابط، تُجمع السلاسل في مكان واحد.
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <Library size={20} className="mb-3" />
            <h3 className="text-lg font-semibold">بداية قابلة للتوسعة</h3>
            <p className="mt-2 leading-8 text-stone-600">
              لاحقًا يمكن إضافة الملفات الصوتية والتصنيفات والبحث المتقدم.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}