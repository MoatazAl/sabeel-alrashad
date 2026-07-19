import Link from "next/link";
import type { LibraryItem } from "@/data/library-items";
import { DocumentCover } from "@/components/document-cover";
import {
  createDownloadUrl,
  getLibraryItemHref,
  getLibraryTypeLabel,
} from "@/lib/library-items";

type LibraryItemCardProps = {
  item: LibraryItem;
  compact?: boolean;
};

export function LibraryItemCard({ item, compact = false }: LibraryItemCardProps) {
  const href = getLibraryItemHref(item);
  const downloadUrl = createDownloadUrl(item.fileUrl);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <Link href={href} className="block">
        <DocumentCover item={item} compact={compact} />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold">
          <span className="rounded-full border border-teal-900/15 bg-teal-50 px-3 py-1 text-teal-900">
            {getLibraryTypeLabel(item.type)}
          </span>
        </div>

        <h3 className="text-xl font-bold leading-8 text-stone-950">
          {item.title}
        </h3>
        <p className="mt-3 text-base leading-8 text-stone-600">
          {item.authorName}
        </p>
        {item.edition ? (
          <p className="mt-2 text-sm font-bold leading-7 text-stone-500">
            {item.edition}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          <Link
            href={href}
            aria-label={`قراءة ${item.title}`}
            className="rounded-md bg-teal-800 px-5 py-2.5 text-base font-semibold text-white transition hover:bg-teal-900"
          >
            قراءة
          </Link>
          <a
            href={downloadUrl}
            aria-label={`تحميل ${item.title}`}
            className="rounded-md border border-stone-300 bg-white px-5 py-2.5 text-base font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            تحميل
          </a>
        </div>
      </div>
    </article>
  );
}
