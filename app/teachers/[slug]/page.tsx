import { notFound, redirect } from "next/navigation";
import { BookCard } from "@/components/book-card";
import { LibraryItemCard } from "@/components/library-item-card";
import {
  TeacherProfileNavigation,
  type TeacherProfileNavigationItem,
} from "@/components/teacher-profile-navigation";
import { books, sheikhs } from "@/data/library";
import { sortBooksByRecent } from "@/lib/library";
import { filterLibraryItems } from "@/lib/library-items";

type TeacherPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return sheikhs.map((sheikh) => ({
    slug: sheikh.slug,
  }));
}

export default async function TeacherPage({ params }: TeacherPageProps) {
  const { slug } = await params;
  if (slug === "saad-zaatari") {
    redirect("/teachers/saad-al-zaatari");
  }

  if (slug === "asad-zaatari") {
    redirect("/teachers/asaad-al-zaatari");
  }

  const sheikh = sheikhs.find((item) => item.slug === slug);

  if (!sheikh) return notFound();

  const teacherCourses = sortBooksByRecent(
    books.filter(
      (book) =>
        book.explainerSlug === sheikh.slug || book.sheikhSlug === sheikh.slug
    )
  );
  const authorSlug = sheikh.authorSlug ?? sheikh.slug;
  const teacherBooks = filterLibraryItems({ type: "book", authorSlug });
  const teacherArticles = filterLibraryItems({ type: "article", authorSlug });
  const navigationItems: TeacherProfileNavigationItem[] = [
    teacherCourses.length > 0
      ? {
          id: "teacher-courses",
          label: "السلاسل والدروس الصوتية",
        }
      : null,
    teacherBooks.length > 0
      ? {
          id: "teacher-books",
          label: "الكتب",
        }
      : null,
    teacherArticles.length > 0
      ? {
          id: "teacher-articles",
          label: "المقالات والرسائل",
        }
      : null,
  ].filter((item): item is TeacherProfileNavigationItem => item !== null);

  return (
    <main>
      <section className="border-b border-stone-200 bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="text-4xl font-bold text-stone-950 md:text-5xl">{sheikh.name}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-9 text-stone-600">
            {sheikh.bio}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div
          dir="rtl"
          className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-10 xl:gap-14"
        >
          <TeacherProfileNavigation items={navigationItems} />

          <div className="min-w-0 space-y-16">
            {teacherCourses.length > 0 ? (
              <section
                id="teacher-courses"
                aria-labelledby="teacher-courses-heading"
                className="scroll-mt-52 lg:scroll-mt-28"
              >
                <h2
                  id="teacher-courses-heading"
                  className="mb-6 text-3xl font-bold text-stone-950"
                >
                  السلاسل والدروس الصوتية
                </h2>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {teacherCourses.map((course) => (
                    <BookCard key={course.slug} book={course} />
                  ))}
                </div>
              </section>
            ) : null}

            {teacherBooks.length > 0 ? (
              <section
                id="teacher-books"
                aria-labelledby="teacher-books-heading"
                className="scroll-mt-52 lg:scroll-mt-28"
              >
                <h2
                  id="teacher-books-heading"
                  className="mb-6 text-3xl font-bold text-stone-950"
                >
                  الكتب
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {teacherBooks.map((book) => (
                    <LibraryItemCard key={book.id} item={book} />
                  ))}
                </div>
              </section>
            ) : null}

            {teacherArticles.length > 0 ? (
              <section
                id="teacher-articles"
                aria-labelledby="teacher-articles-heading"
                className="scroll-mt-52 lg:scroll-mt-28"
              >
                <h2
                  id="teacher-articles-heading"
                  className="mb-6 text-3xl font-bold text-stone-950"
                >
                  المقالات والرسائل
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {teacherArticles.map((article) => (
                    <LibraryItemCard key={article.id} item={article} compact />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
