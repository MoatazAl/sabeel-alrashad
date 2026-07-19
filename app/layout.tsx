import "@fontsource/cairo/400.css";
import "@fontsource/cairo/500.css";
import "@fontsource/cairo/600.css";
import "@fontsource/cairo/700.css";
import "@fontsource/cairo/800.css";
import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "سبيل الرشاد",
  description: "مكتبة عربية هادئة لتصفح الدروس والسلاسل العلمية",
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
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-10 text-center text-sm text-gray-600 sm:px-6 lg:px-8">
            <span className="font-bold text-emerald-950">سبيل الرشاد</span>
            <span>مكتبة تعليمية مرتبة للكتب والدروس والسلاسل العلمية.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
