import { notFound } from "next/navigation";
import { PdfReader } from "@/components/pdf-reader";
import {
  getLibraryItem,
  itemTypeToRouteType,
  libraryItems,
} from "@/lib/library-items";

type LibraryItemPageProps = {
  params: Promise<{
    type: string;
    slug: string;
  }>;
};

export function generateStaticParams() {
  return libraryItems.map((item) => ({
    type: itemTypeToRouteType(item.type),
    slug: item.slug,
  }));
}

export default async function LibraryItemPage({ params }: LibraryItemPageProps) {
  const { type, slug } = await params;
  const item = getLibraryItem(type, slug);

  if (!item) return notFound();

  return (
    <main>
      <section className="border-b border-stone-200 bg-[#fbfaf7]">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6">
          <h1 className="text-3xl font-bold leading-tight text-stone-950 md:text-4xl">
            {item.title}
          </h1>
          <p className="mt-3 text-lg leading-9 text-stone-600">
            المؤلف: {item.authorName}
          </p>
          {item.edition ? (
            <p className="mt-1 text-sm font-semibold text-stone-500">
              {item.edition}
            </p>
          ) : null}
        </div>
      </section>

      <section className="py-6 sm:py-8">
        <PdfReader fileUrl={item.fileUrl} title={item.title} />
      </section>
    </main>
  );
}
