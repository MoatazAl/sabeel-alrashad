"use client";

import { useEffect, useState } from "react";

export type TeacherProfileNavigationItem = {
  id: string;
  label: string;
};

type TeacherProfileNavigationProps = {
  items: TeacherProfileNavigationItem[];
};

export function TeacherProfileNavigation({
  items,
}: TeacherProfileNavigationProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    let animationFrame = 0;

    const updateActiveSection = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const stickyOffset = window.innerWidth >= 1024 ? 112 : 208;
        let nextActiveId = items[0]?.id ?? "";

        for (const item of items) {
          const section = document.getElementById(item.id);

          if (section && section.getBoundingClientRect().top <= stickyOffset) {
            nextActiveId = item.id;
          }
        }

        setActiveId((currentId) =>
          currentId === nextActiveId ? currentId : nextActiveId
        );
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [items]);

  function scrollToSection(id: string) {
    const section = document.getElementById(id);
    if (!section) return;

    setActiveId(id);
    section.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <>
      <div className="sticky top-[8.5rem] z-30 mb-8 rounded-xl border border-stone-200 bg-[#fdfbf7]/95 p-3 shadow-sm backdrop-blur lg:hidden">
        <label
          htmlFor="teacher-profile-section"
          className="mb-1.5 block text-xs font-bold text-stone-600"
        >
          الانتقال إلى القسم
        </label>
        <select
          id="teacher-profile-section"
          value={activeId}
          onChange={(event) => scrollToSection(event.target.value)}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm font-bold text-stone-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
        >
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <aside className="hidden lg:sticky lg:top-28 lg:block">
        <nav
          aria-label="أقسام صفحة الشيخ"
          className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm"
        >
          <p className="px-3 pb-2 pt-1 text-sm font-bold text-stone-500">
            محتويات الصفحة
          </p>
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = activeId === item.id;

              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={isActive ? "location" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToSection(item.id);
                    }}
                    className={`block rounded-lg border-r-2 px-3 py-2.5 text-sm font-bold leading-7 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 ${
                      isActive
                        ? "border-emerald-800 bg-emerald-50 text-emerald-900"
                        : "border-transparent text-stone-600 hover:bg-stone-50 hover:text-stone-950"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
