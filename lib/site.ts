import type { Metadata } from "next";

export const SITE_NAME = "سبيل الرشاد";
export const SITE_ALTERNATE_NAME = "Sabeel Al-Rashad";
export const SITE_URL = "https://sabeelalrashad.com";
export const SITE_DESCRIPTION =
  "سبيل الرشاد موقع إسلامي يضم الدروس العلمية والدورات الصوتية والكتب والمقالات والمحتوى الشرعي لطلاب العلم.";
export const DEFAULT_OPEN_GRAPH_IMAGE =
  "/images/courses/nukhbat-al-fikar/000.png";

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OPEN_GRAPH_IMAGE,
  appendSiteName = true,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  appendSiteName?: boolean;
}): Metadata {
  const resolvedTitle = appendSiteName ? `${title} | ${SITE_NAME}` : title;

  return {
    title: { absolute: resolvedTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: resolvedTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "ar_PS",
      type: "website",
      images: [
        {
          url: absoluteUrl(image),
          alt: resolvedTitle,
        },
      ],
    },
  };
}
