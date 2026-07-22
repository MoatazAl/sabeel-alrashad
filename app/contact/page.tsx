import { ContactEmailCard } from "@/components/contact-email-card";
import { JsonLd } from "@/components/json-ld";
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  createPageMetadata,
  siteConfig,
} from "@/lib/site";

const description =
  "تواصل مع إدارة سبيل الرشاد لإرسال الملاحظات والتصحيحات والاقتراحات المتعلقة بالموقع.";

export const metadata = createPageMetadata({
  title: "تواصل معنا",
  description,
  path: "/contact",
});

const contactPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "تواصل معنا",
  description,
  url: absoluteUrl("/contact"),
  inLanguage: "ar",
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
  mainEntity: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    email: siteConfig.contactEmail,
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contactEmail,
      contactType: "إدارة الموقع",
      availableLanguage: "ar",
    },
  },
};

const contactReasons = [
  "الإبلاغ عن خطأ في اسم كتاب أو درس أو مؤلف",
  "الإبلاغ عن رابط أو ملف لا يعمل",
  "اقتراح إضافة مادة علمية",
  "إرسال ملاحظة تقنية حول الموقع",
];

export default function ContactPage() {
  return (
    <main>
      <JsonLd data={contactPageStructuredData} />

      <section className="border-b border-stone-200 bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold leading-tight text-stone-950 md:text-5xl">
            تواصل معنا
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-9 text-stone-600">
            نسعد باستقبال الملاحظات والتصحيحات والاقتراحات المتعلقة بمحتوى
            الموقع.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <ul className="space-y-3 text-base leading-8 text-stone-700 sm:text-lg">
          {contactReasons.map((reason) => (
            <li key={reason} className="flex items-start gap-3">
              <span
                className="mt-3 h-2 w-2 shrink-0 rounded-full bg-emerald-800"
                aria-hidden="true"
              />
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <ContactEmailCard email={siteConfig.contactEmail} />
        </div>

        <p className="mt-6 text-sm leading-7 text-stone-600 sm:text-base sm:leading-8">
          يرجى توضيح اسم الصفحة أو المادة عند الإبلاغ عن مشكلة، وإرفاق الرابط
          إن أمكن.
        </p>
      </section>
    </main>
  );
}
