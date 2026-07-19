import Link from "next/link";

type CategoryPillsProps = {
  categories: readonly string[];
  activeCategory?: string;
  hrefForCategory?: (category: string) => string;
};

export function CategoryPills({
  categories,
  activeCategory,
  hrefForCategory,
}: CategoryPillsProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {categories.map((category) => {
        const isActive = activeCategory === category;

        return (
          <Link
            key={category}
            href={
              hrefForCategory
                ? hrefForCategory(category)
                : `/library?category=${encodeURIComponent(category)}`
            }
            className={[
              "rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 sm:px-5 sm:text-base",
              isActive
                ? "border-emerald-900 bg-emerald-900 text-white shadow-sm"
                : "border-stone-200/80 bg-white text-stone-600 shadow-sm hover:border-emerald-800/30 hover:bg-emerald-50 hover:text-emerald-900",
            ].join(" ")}
          >
            {category}
          </Link>
        );
      })}
    </div>
  );
}
