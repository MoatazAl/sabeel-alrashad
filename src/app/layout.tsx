import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سبيل الرشاد",
  description: "منصة بسيطة لتتبع دروس المشايخ والسلاسل العلمية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              سبيل الرشاد
            </Link>

            <nav className="flex items-center gap-5 text-sm text-stone-700">
              <Link href="/">الرئيسية</Link>
              <Link href="/library">المكتبة</Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="mt-20 border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-8 text-sm leading-7 text-stone-500">
            سبيل الرشاد — منصة أولية تساعد طلاب العلم على الوصول السريع إلى السلاسل العلمية وقوائم التشغيل.
          </div>
        </footer>
      </body>
    </html>
  );
}