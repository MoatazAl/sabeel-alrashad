import { JsonLd } from "@/components/json-ld";
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  createPageMetadata,
} from "@/lib/site";

const description =
  "تعرف على منصة سبيل الرشاد ومحتواها من الدروس والكتب والمقالات والرسائل العلمية.";

export const metadata = createPageMetadata({
  title: "عن سبيل الرشاد",
  description,
  path: "/about",
});

const aboutPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "عن سبيل الرشاد",
  description,
  url: absoluteUrl("/about"),
  inLanguage: "ar",
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
};

const contentItems = [
  "السلاسل والدروس الصوتية",
  "الكتب والمؤلفات",
  "المقالات والرسائل العلمية",
];

export default function AboutPage() {
  return (
    <main>
      <JsonLd data={aboutPageStructuredData} />

      <section className="border-b border-stone-200 bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold leading-tight text-stone-950 md:text-5xl">
            عن سبيل الرشاد
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="space-y-5 text-base leading-9 text-stone-700 sm:text-lg sm:leading-10">
          <p>
            سبيل الرشاد منصة علمية تهتم بجمع وترتيب ونشر الدروس الصوتية،
            والكتب، والمقالات والرسائل العلمية، بما يسهل الوصول إلى مواد
            المشايخ والاستفادة منها.
          </p>
          <p>
            نحرص على عرض المواد بصورة واضحة ومنظمة، مع بيان اسم المؤلف
            والشارح وتصنيف المحتوى، وإتاحة الاستماع والقراءة عبر الموقع.
          </p>
          <p>
            جميع الكتب والدروس والمقالات منسوبة إلى أصحابها، ويهدف الموقع إلى
            خدمة العلم وتيسير الوصول إلى مواده.
          </p>
        </div>

        <section
          aria-labelledby="site-content-heading"
          className="mt-12 border-t border-stone-200 pt-9"
        >
          <h2
            id="site-content-heading"
            className="text-2xl font-bold text-stone-950"
          >
            محتوى الموقع
          </h2>
          <ul className="mt-6 grid gap-x-10 gap-y-4 text-base font-semibold text-stone-800 sm:grid-cols-3">
            {contentItems.map((item) => (
              <li key={item} className="flex items-start gap-3 leading-8">
                <span
                  className="mt-3 h-2 w-2 shrink-0 rounded-full bg-emerald-800"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}
