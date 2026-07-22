import "@fontsource/cairo/400.css";
import "@fontsource/cairo/500.css";
import "@fontsource/cairo/600.css";
import "@fontsource/cairo/700.css";
import "@fontsource/cairo/800.css";
import "./globals.css";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";
import { Header } from "@/components/header";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  siteConfig,
} from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col">
        <Header />

        <div className="flex-1">{children}</div>

        <footer className="border-t border-stone-200/80 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-10 text-center text-sm text-gray-600 sm:px-6 lg:px-8">
            <span className="font-bold text-emerald-950">سبيل الرشاد</span>
            <span>مكتبة تعليمية مرتبة للكتب والدروس والسلاسل العلمية.</span>
            <nav
              aria-label="روابط تذييل الموقع"
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-semibold text-gray-700"
            >
              <Link
                href="/about"
                className="rounded-md px-2 py-1 transition hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
              >
                عن الموقع
              </Link>
              <Link
                href="/contact"
                className="rounded-md px-2 py-1 transition hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
              >
                تواصل معنا
              </Link>
            </nav>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              dir="ltr"
              className="rounded-md px-2 py-1 font-medium text-emerald-800 transition hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
            >
              {siteConfig.contactEmail}
            </a>
          </div>
        </footer>

        <SpeedInsights />
      </body>
    </html>
  );
}
