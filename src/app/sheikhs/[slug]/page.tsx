import Link from "next/link";
import { notFound } from "next/navigation";
import { sheikhs, seriesList } from "@/data/library";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function SheikhPage({ params }: Props) {
  const { slug } = await params;

  const sheikh = sheikhs.find((s) => s.slug === slug);
  if (!sheikh) return notFound();

  const relatedSeries = seriesList.filter((s) => s.sheikhSlug === slug);

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">
          ← العودة للرئيسية
        </Link>

        <div className="mt-4 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="mb-3 inline-flex rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700">
            الشيخ
          </div>
          <h1 className="text-3xl font-bold">{sheikh.name}</h1>
          <p className="mt-4 max-w-3xl leading-8 text-stone-600">{sheikh.bio}</p>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold">السلاسل المتاحة</h2>
          <div className="mt-5 grid gap-4">
            {relatedSeries.map((item) => (
              <Link
                key={item.slug}
                href={`/series/${item.slug}`}
                className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:bg-stone-50"
              >
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 leading-8 text-stone-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}