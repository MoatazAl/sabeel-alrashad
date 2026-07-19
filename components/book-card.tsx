import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { Book } from "@/lib/types";

type BookCardProps = {
  book: Book;
};

export function BookCard({ book }: BookCardProps) {
  const status = book.status || "completed";
  const hasDarkCoverFrame = book.coverFrame === "dark";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200/60 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-800/20 hover:shadow-md">
      {book.coverImage ? (
        <Link
          href={`/books/${book.slug}`}
          className={`relative block aspect-[16/10] overflow-hidden ${
            hasDarkCoverFrame ? "bg-[#1b0d0b]" : "bg-stone-100"
          }`}
        >
          <span
            className={`absolute ${
              hasDarkCoverFrame ? "inset-2 sm:inset-3" : "inset-0"
            }`}
          >
            <Image
              src={book.coverImage}
              alt={`صورة سلسلة ${book.title}`}
              fill
              unoptimized={hasDarkCoverFrame}
              sizes="(min-width: 1280px) 380px, (min-width: 768px) 50vw, 100vw"
              className={`transition duration-500 ${
                hasDarkCoverFrame
                  ? "object-contain"
                  : "object-cover group-hover:scale-[1.02]"
              }`}
              style={{
                objectFit: book.imageFit ?? "cover",
                objectPosition: book.imagePosition ?? "center",
              }}
            />
          </span>
        </Link>
      ) : null}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded bg-emerald-50 px-2 py-0.5 font-semibold tracking-wide text-emerald-700">
            {book.category}
          </span>
          <span className="rounded bg-stone-100 px-2 py-0.5 font-semibold tracking-wide text-gray-600">
            {status === "ongoing" ? "مستمرة" : "مكتملة"}
          </span>
        </div>

        <h3 className="text-xl font-bold leading-8 text-gray-800 sm:text-2xl sm:leading-9">
          {book.title}
        </h3>

        <dl className="mt-4 space-y-1.5 text-sm leading-7 text-gray-600 sm:text-base">
          <div>
            <dt className="inline font-semibold text-gray-800">المؤلف: </dt>
            <dd className="inline">{book.authorName}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-gray-800">الشارح: </dt>
            <dd className="inline">{book.explainerName}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-gray-800">عدد الدروس: </dt>
            <dd className="inline">{book.lessonsCount}</dd>
          </div>
        </dl>

        <Link
          href={`/books/${book.slug}`}
          className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-bold text-emerald-800 focus-visible:outline-none focus-visible:underline"
        >
          فتح السلسلة
          <ArrowLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
