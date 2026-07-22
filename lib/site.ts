import type { Metadata } from "next";

export const siteConfig = {
  name: "سبيل الرشاد",
  alternateName: "Sabeel Al-Rashad",
  url: "https://sabeelalrashad.com",
  description:
    "سبيل الرشاد موقع إسلامي يضم الدروس العلمية والدورات الصوتية والكتب والمقالات والمحتوى الشرعي لطلاب العلم.",
  contactEmail: "contact@sabeelalrashad.com",
  defaultOpenGraphImage: "/images/courses/nukhbat-al-fikar/000.png",
} as const;

export const SITE_NAME = siteConfig.name;
export const SITE_ALTERNATE_NAME = siteConfig.alternateName;
export const SITE_URL = siteConfig.url;
export const SITE_DESCRIPTION = siteConfig.description;
export const DEFAULT_OPEN_GRAPH_IMAGE = siteConfig.defaultOpenGraphImage;

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
