import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { MainNavigation } from "@/components/main-navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link
          href="/"
          className="group flex w-fit items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-4"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-900 text-white shadow-sm transition group-hover:bg-emerald-800">
            <BookOpenText className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-2xl font-extrabold leading-tight tracking-tight text-gray-800">
              سبيل الرشاد
            </span>
            <span className="mt-0.5 block text-xs font-normal text-gray-600 sm:text-sm">
              مكتبة علمية للدروس والسلاسل
            </span>
          </span>
        </Link>

        <MainNavigation />
      </div>
    </header>
  );
}
