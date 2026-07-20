export type LibraryItemType = "book" | "article";

export type LibraryItem = {
  id: string;
  slug: string;
  title: string;
  authorName: string;
  authorSlug: string;
  type: LibraryItemType;
  fileName: string;
  fileUrl: string;
  coverImage?: string;
  description?: string;
  edition?: string;
  featured?: boolean;
};

const booksBaseUrl =
  process.env.NEXT_PUBLIC_BOOKS_BASE_URL ?? "https://books.sabeelalrashad.com";
const articlesBaseUrl =
  process.env.NEXT_PUBLIC_ARTICLES_BASE_URL ??
  "https://articles.sabeelalrashad.com";
const raedAuthor = {
  name: "فضيلة الشيخ رائد بن عبد الجبار المهداوي",
  slug: "raed-al-mahdawi",
} as const;
const saadAuthor = {
  name: "فضيلة الشيخ سعد بن فتحي الزعتري",
  slug: "saad-al-zaatari",
} as const;

function bookUrl(fileName: string) {
  return `${booksBaseUrl}/${raedAuthor.slug}/${fileName}`;
}

function articleUrl(fileName: string) {
  return `${articlesBaseUrl}/${raedAuthor.slug}/${fileName}`;
}

const books: LibraryItem[] = [
  {
    id: "raed-book-al-ilmam",
    slug: "al-ilmam",
    title: "الإلمام بأحكام الصيام والقيام",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "book",
    fileName: "al-ilmam-bi-ahkam-al-siyam-wal-qiyam-2.pdf",
    fileUrl: bookUrl("al-ilmam-bi-ahkam-al-siyam-wal-qiyam-2.pdf"),
    edition: "الطبعة الثانية",
    featured: true,
  },
  {
    id: "raed-book-al-sihr-wal-ruqyah",
    slug: "al-sihr-wal-ruqyah",
    title: "السحر والرقية الشرعية ومخالفات الرقاة",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "book",
    fileName: "al-sihr-wal-ruqyah-al-shariyyah.pdf",
    fileUrl: bookUrl("al-sihr-wal-ruqyah-al-shariyyah.pdf"),
    featured: true,
  },
  {
    id: "raed-book-fiqh-al-sawm",
    slug: "fiqh-al-sawm",
    title: "فقه الصوم الميسر",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "book",
    fileName: "fiqh-al-sawm-al-muyassar.pdf",
    fileUrl: bookUrl("fiqh-al-sawm-al-muyassar.pdf"),
    featured: true,
  },
  {
    id: "raed-book-ghayat-al-amani",
    slug: "ghayat-al-amani",
    title: "غاية الأماني شرح أصول السنة",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "book",
    fileName: "ghayat-al-amani-sharh-usul-al-sunnah.pdf",
    fileUrl: bookUrl("ghayat-al-amani-sharh-usul-al-sunnah.pdf"),
    featured: true,
  },
];

const articles: LibraryItem[] = [
  {
    id: "raed-article-ahkam-al-khuffayn",
    slug: "ahkam-al-khuffayn",
    title: "أحكام المسح على الخفين والنعلين والجوربين",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "ahkam-al-khuffayn.pdf",
    fileUrl: articleUrl("ahkam-al-khuffayn.pdf"),
  },
  {
    id: "raed-article-al-amr-wal-nahy",
    slug: "al-amr-wal-nahy",
    title: "الأمر بالمعروف والنهي عن المنكر",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "al-amr-wal-nahy.pdf",
    fileUrl: articleUrl("al-amr-wal-nahy.pdf"),
  },
  {
    id: "raed-article-al-athar-al-qadimah",
    slug: "al-athar-al-qadimah",
    title: "الآثار القديمة",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "al-athar-al-qadimah.pdf",
    fileUrl: articleUrl("al-athar-al-qadimah.pdf"),
  },
  {
    id: "raed-article-al-bayyinah-wal-yamin",
    slug: "al-bayyinah-wal-yamin",
    title: "كيف نفهم حديث: البينة على المدعي، واليمين على من أنكر؟",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "al-bayyinah-wal-yamin.pdf",
    fileUrl: articleUrl("al-bayyinah-wal-yamin.pdf"),
  },
  {
    id: "raed-article-al-bursa",
    slug: "al-bursa",
    title: "البورصة",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "al-bursa.pdf",
    fileUrl: articleUrl("al-bursa.pdf"),
  },
  {
    id: "raed-article-al-difa-an-al-nabi",
    slug: "al-difa-an-al-nabi",
    title: "الدفاع عن نبينا محمد صلى الله عليه وسلم",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "al-difa-an-al-nabi.pdf",
    fileUrl: articleUrl("al-difa-an-al-nabi.pdf"),
  },
  {
    id: "raed-article-al-falatan-al-amni",
    slug: "al-falatan-al-amni",
    title: "الفلتان الأمني: أسبابه وآثاره وعلاجه",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "al-falatan-al-amni.pdf",
    fileUrl: articleUrl("al-falatan-al-amni.pdf"),
  },
  {
    id: "raed-article-al-mursal-al-khafi",
    slug: "al-mursal-al-khafi",
    title: "المرسل الخفي",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "al-mursal-al-khafi.pdf",
    fileUrl: articleUrl("al-mursal-al-khafi.pdf"),
  },
  {
    id: "raed-article-al-ruqyah",
    slug: "al-ruqyah",
    title: "الرقية الشرعية",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "al-ruqyah.pdf",
    fileUrl: articleUrl("al-ruqyah.pdf"),
  },
  {
    id: "raed-article-al-tawil-al-fasid",
    slug: "al-tawil-al-fasid",
    title: "التأويل الفاسد مطية أهل الأهواء والبدع",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "al-tawil-al-fasid.pdf",
    fileUrl: articleUrl("al-tawil-al-fasid.pdf"),
  },
  {
    id: "raed-article-fadael-arafah",
    slug: "fadael-arafah",
    title: "فضائل يوم عرفة",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "fadael-arafah.pdf",
    fileUrl: articleUrl("fadael-arafah.pdf"),
  },
  {
    id: "raed-article-fiqh-al-nasihah",
    slug: "fiqh-al-nasihah",
    title: "فقه النصيحة",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "fiqh-al-nasihah.pdf",
    fileUrl: articleUrl("fiqh-al-nasihah.pdf"),
  },
  {
    id: "raed-article-haqiqat-al-tawhid",
    slug: "haqiqat-al-tawhid",
    title: "كتاب حقيقة التوحيد لمحمد حسان",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "haqiqat-al-tawhid.pdf",
    fileUrl: articleUrl("haqiqat-al-tawhid.pdf"),
  },
  {
    id: "raed-article-hukm-al-taziyah",
    slug: "hukm-al-taziyah",
    title: "حكم الجلوس للتعزية والاجتماع لها واتخاذ الضيافة للمعزين",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "hukm-al-taziyah.pdf",
    fileUrl: articleUrl("hukm-al-taziyah.pdf"),
  },
  {
    id: "raed-article-ithbat-shahr-al-sawm",
    slug: "ithbat-shahr-al-sawm",
    title: "إثبات شهر الصوم",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "ithbat-shahr-al-sawm.pdf",
    fileUrl: articleUrl("ithbat-shahr-al-sawm.pdf"),
  },
  {
    id: "raed-article-khatar-al-takhbib",
    slug: "khatar-al-takhbib",
    title: "نصيحة الأريب بخطر أهل التخبيب",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "khatar-al-takhbib.pdf",
    fileUrl: articleUrl("khatar-al-takhbib.pdf"),
  },
  {
    id: "raed-article-khatar-al-tashqiq",
    slug: "khatar-al-tashqiq",
    title: "نصيحة الرفيق بخطر أهل التشقيق",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "khatar-al-tashqiq.pdf",
    fileUrl: articleUrl("khatar-al-tashqiq.pdf"),
  },
  {
    id: "raed-article-khayr-al-wahid",
    slug: "khayr-al-wahid",
    title: "خير الواحد في الرسالة للإمام الشافعي",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "khayr-al-wahid.pdf",
    fileUrl: articleUrl("khayr-al-wahid.pdf"),
  },
  {
    id: "raed-article-khutbat-daesh",
    slug: "khutbat-daesh",
    title: "خطبة جمعة بعنوان: داعش وجريمة حرق الطيار الأردني",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "khutbat-daesh.pdf",
    fileUrl: articleUrl("khutbat-daesh.pdf"),
  },
  {
    id: "raed-article-maalat-al-aqwal",
    slug: "maalat-al-aqwal",
    title: "مراعاة مآلات الأقوال والأفعال",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "maalat-al-aqwal.pdf",
    fileUrl: articleUrl("maalat-al-aqwal.pdf"),
  },
  {
    id: "raed-article-maana-al-taghut",
    slug: "maana-al-taghut",
    title: "فواتح ذي الملكوت في بيان معنى الطاغوت",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "maana-al-taghut.pdf",
    fileUrl: articleUrl("maana-al-taghut.pdf"),
  },
  {
    id: "raed-article-madha-yaqul-al-mumayiah",
    slug: "madha-yaqul-al-mumayiah",
    title: "ماذا يقول المميعة؟",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "madha-yaqul-al-mumayiah.pdf",
    fileUrl: articleUrl("madha-yaqul-al-mumayiah.pdf"),
  },
  {
    id: "raed-article-madhhab-al-albani",
    slug: "madhhab-al-albani",
    title: "تحقيق مذهب الإمام الألباني",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "madhhab-al-albani.pdf",
    fileUrl: articleUrl("madhhab-al-albani.pdf"),
  },
  {
    id: "raed-article-man-hum-al-ulama",
    slug: "man-hum-al-ulama",
    title: "من هم العلماء؟",
    authorName: raedAuthor.name,
    authorSlug: raedAuthor.slug,
    type: "article",
    fileName: "man-hum-al-ulama.pdf",
    fileUrl: articleUrl("man-hum-al-ulama.pdf"),
  },
  {
    id: "saad-article-dirasat-al-muhaddith-al-fasil",
    slug: "dirasat-al-muhaddith-al-fasil",
    title: "دراسة حول كتاب المحدث الفاصل",
    authorName: saadAuthor.name,
    authorSlug: saadAuthor.slug,
    type: "article",
    fileName: "dirasat-al-muhaddith-al-fasil.pdf",
    fileUrl: `${articlesBaseUrl}/${saadAuthor.slug}/dirasat-al-muhaddith-al-fasil.pdf`,
  },
  {
    id: "saad-article-fadl-al-ilm-bil-quran",
    slug: "fadl-al-ilm-bil-quran",
    title: "فضل العلم بالقرآن",
    authorName: saadAuthor.name,
    authorSlug: saadAuthor.slug,
    type: "article",
    fileName: "fadl-al-ilm-bil-quran.pdf",
    fileUrl: `${articlesBaseUrl}/${saadAuthor.slug}/fadl-al-ilm-bil-quran.pdf`,
  },
  {
    id: "saad-article-mafhum-al-sunnah",
    slug: "mafhum-al-sunnah",
    title: "مفهوم السنة في الدعوة السلفية",
    authorName: saadAuthor.name,
    authorSlug: saadAuthor.slug,
    type: "article",
    fileName: "mafhum-al-sunnah.pdf",
    fileUrl: `${articlesBaseUrl}/${saadAuthor.slug}/mafhum-al-sunnah.pdf`,
  },
  {
    id: "saad-article-tahdhir-ahl-al-afaq",
    slug: "tahdhir-ahl-al-afaq",
    title: "تحذير أهل الآفاق من منهج الحويني أبي إسحاق",
    authorName: saadAuthor.name,
    authorSlug: saadAuthor.slug,
    type: "article",
    fileName: "tahdhir-ahl-al-afaq.pdf",
    fileUrl: `${articlesBaseUrl}/${saadAuthor.slug}/tahdhir-ahl-al-afaq.pdf`,
  },
  {
    id: "saad-article-takhil-uyun-al-salafiyyin",
    slug: "takhil-uyun-al-salafiyyin",
    title: "تكحيل عيون السلفيين",
    authorName: saadAuthor.name,
    authorSlug: saadAuthor.slug,
    type: "article",
    fileName: "takhil-uyun-al-salafiyyin.pdf",
    fileUrl: `${articlesBaseUrl}/${saadAuthor.slug}/takhil-uyun-al-salafiyyin.pdf`,
  },
  {
    id: "saad-article-takhrij-ma-yusib-al-mumin",
    slug: "takhrij-ma-yusib-al-mumin",
    title: "تخريج حديث «ما من شيء يصيب المؤمن…»",
    authorName: saadAuthor.name,
    authorSlug: saadAuthor.slug,
    type: "article",
    fileName: "takhrij-ma-yusib-al-mumin.pdf",
    fileUrl: `${articlesBaseUrl}/${saadAuthor.slug}/takhrij-ma-yusib-al-mumin.pdf`,
  },
];

export const libraryItems = [...books, ...articles];

export const libraryAuthors = [
  {
    name: raedAuthor.name,
    slug: raedAuthor.slug,
  },
  {
    name: saadAuthor.name,
    slug: saadAuthor.slug,
  },
];
