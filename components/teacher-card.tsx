import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import type { Sheikh } from "@/lib/types";

type TeacherCardProps = {
  sheikh: Sheikh;
};

export function TeacherCard({ sheikh }: TeacherCardProps) {
  return (
    <Link
      href={`/teachers/${sheikh.slug}`}
      className="group flex min-h-56 flex-col rounded-xl border border-stone-200/60 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-800/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
        <GraduationCap className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-xl font-bold leading-8 text-gray-800">
        {sheikh.name}
      </h3>
      <span className="my-4 h-px w-full bg-stone-100" aria-hidden="true" />
      <p className="text-sm font-normal leading-7 text-gray-600 sm:text-base">
        {sheikh.bio}
      </p>
      <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 transition group-hover:bg-emerald-100">
        تصفح المواد
        <ArrowLeft
          className="h-4 w-4 transition-transform group-hover:-translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
