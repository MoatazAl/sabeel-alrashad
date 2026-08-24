"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "الرئيسية", section: "home" },
  { href: "/library", label: "المكتبة", section: "library" },
  { href: "/teachers", label: "الشيوخ", section: "scholars" },
  { href: "/lessons", label: "الدروس", section: "lessons" },
] as const;

type NavigationSection = (typeof navItems)[number]["section"];

function isPathWithin(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function getActiveSection(pathname: string): NavigationSection | null {
  if (pathname === "/") return "home";
  if (isPathWithin(pathname, "/library")) return "library";
  if (isPathWithin(pathname, "/teachers") || isPathWithin(pathname, "/sheikhs")) {
    return "scholars";
  }
  if (isPathWithin(pathname, "/lessons") || isPathWithin(pathname, "/books")) {
    return "lessons";
  }

  return null;
}

export function MainNavigation() {
  const pathname = usePathname();
  const activeSection = getActiveSection(pathname);

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="grid w-full min-w-0 grid-cols-4 gap-1 rounded-xl bg-stone-100/75 p-1 text-xs font-semibold text-gray-700 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:bg-transparent sm:p-0 sm:text-base"
    >
      {navItems.map((item) => {
        const isActive = item.section === activeSection;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "relative min-w-0 rounded-lg px-1.5 py-1.5 text-center transition hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 sm:px-3.5 sm:py-2",
              isActive
                ? "bg-white font-bold text-emerald-950 shadow-sm after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-emerald-700 hover:text-emerald-900 sm:bg-transparent sm:text-stone-950 sm:shadow-none sm:after:inset-x-3.5 sm:after:bottom-0.5"
                : "",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
