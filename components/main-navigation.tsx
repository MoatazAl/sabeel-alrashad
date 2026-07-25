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
      className="flex flex-wrap items-center gap-1 text-sm font-semibold text-gray-700 sm:text-base"
    >
      {navItems.map((item) => {
        const isActive = item.section === activeSection;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "relative rounded-lg px-3.5 py-2 transition hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800",
              isActive
                ? "font-bold text-stone-950 after:absolute after:inset-x-3.5 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-emerald-700 hover:text-emerald-900"
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
