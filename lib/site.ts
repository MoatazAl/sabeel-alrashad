import type { Metadata } from "next";

export const SITE_NAME = "سبيل الرشاد";
export const SITE_ALTERNATE_NAME = "Sabeel Al-Rashad";
export const SITE_URL = "https://sabeelalrashad.com";
export const SITE_DESCRIPTION =
  "سبيل الرشاد موقع إسلامي يضم الدروس العلمية والدورات الصوتية والكتب والمقالات والمحتوى الشرعي لطلاب العلم.";

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "ar_PS",
      type: "website",
    },
  };
}
