import Link from "next/link";
import { notFound } from "next/navigation";
import { seriesList, sheikhs } from "@/data/library";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;

  const series = seriesList.find((s) => s.slug === slug);
  if (!series) return notFound();

  const sheikh = sheikhs.find((s) => s.slug === series.sheikhSlug);

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href={`/sheikhs/${series.sheikhSlug}`}
          className="text-sm text-stone-500 hover:text-stone-800"
        >
          ← العودة إلى صفحة الشيخ
        </Link>

        <div className="mt-4 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="text-sm text-stone-500">{sheikh?.name}</div>
          <h1 className="mt-2 text-3xl font-bold leading-tight">{series.title}</h1>
          <p className="mt-4 leading-8 text-stone-600">{series.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={series.playlistUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              فتح قائمة التشغيل كاملة
            </a>

            <Link
              href="/library"
              className="rounded-2xl border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              العودة إلى المكتبة
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">ملاحظات</h2>
          <ul className="mt-4 space-y-3 leading-8 text-stone-600">
            <li>• هذه النسخة الأولى تركّز على جمع السلاسل الكاملة بدل إدراج درس واحد فقط.</li>
            <li>• لاحقًا يمكننا إضافة تفريغ دروس السلسلة إلى دروس منفصلة داخل الموقع.</li>
            <li>• ويمكن أيضًا إرفاق ملفات صوتية وروابط خارجية إضافية.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}