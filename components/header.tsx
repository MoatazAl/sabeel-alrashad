import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { MainNavigation } from "@/components/main-navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full overflow-x-clip border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3.5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link
          href="/"
          className="group flex w-fit min-w-0 items-center gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 sm:gap-3 sm:focus-visible:ring-offset-4"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-900 text-white shadow-sm transition group-hover:bg-emerald-800 sm:h-11 sm:w-11 sm:rounded-xl">
            <BookOpenText className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-xl font-extrabold leading-tight tracking-tight text-gray-800 sm:text-2xl">
              سبيل الرشاد
            </span>
            <span className="block truncate text-[11px] font-normal leading-4 text-gray-600 sm:mt-0.5 sm:text-sm">
              مكتبة علمية للدروس والسلاسل
            </span>
          </span>
        </Link>

        <MainNavigation />
      </div>
    </header>
  );
}
