import { Search } from "lucide-react";

type SearchBarProps = {
  defaultValue?: string;
  placeholder?: string;
  action?: string;
};

export function SearchBar({
  defaultValue = "",
  placeholder = "ابحث باسم الكتاب أو الشيخ أو الباب...",
  action = "/library",
}: SearchBarProps) {
  return (
    <form action={action} className="w-full">
      <label className="sr-only" htmlFor="library-search">
        البحث في المكتبة
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white p-1.5 shadow-sm transition focus-within:border-emerald-700 focus-within:ring-4 focus-within:ring-emerald-900/10">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          />
          <input
            id="library-search"
            name="q"
            defaultValue={defaultValue}
            placeholder={placeholder}
            className="min-h-14 w-full rounded-xl bg-transparent py-3 pe-4 ps-12 text-start text-base text-gray-800 outline-none placeholder:text-gray-500 sm:text-lg"
          />
        </div>
        <button
          type="submit"
          className="min-h-12 shrink-0 rounded-xl bg-emerald-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 sm:px-7 sm:text-base"
        >
          بحث
        </button>
      </div>
    </form>
  );
}
