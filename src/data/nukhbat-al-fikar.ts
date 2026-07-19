export const MEDIA_BASE_URL = "https://media.sabeelalrashad.com";

const titles = [
  "المجلس الأول",
  "المجلس الثاني",
  "المجلس الثالث",
  "المجلس الرابع",
  "المجلس الخامس",
  "المجلس السادس",
  "المجلس السابع",
  "المجلس الثامن",
  "المجلس التاسع",
  "المجلس العاشر",
  "المجلس الحادي عشر",
  "المجلس الثاني عشر",
] as const;

export const nukhbatAlFikarBook = {
  slug: "nukhbat-al-fikar",
  title: "شرح نخبة الفكر في مصطلح أهل الأثر",
  sheikh: "فضيلة الشيخ أسعد الزعتري",
  sheikhSlug: "asaad-al-zaatari",
  description: "دروس صوتية في شرح نخبة الفكر.",
  coverImage: "/images/courses/nukhbat-al-fikar/000.png",
  lessonsCount: 12,
  lessons: titles.map((title, index) => {
    const lessonNumber = index + 1;
    const fileNumber = String(lessonNumber).padStart(3, "0");

    return {
      number: lessonNumber,
      title,
      audioUrl: `${MEDIA_BASE_URL}/nukhbat-al-fikar/${fileNumber}.mp3`,
      coverImage: `/images/courses/nukhbat-al-fikar/${fileNumber}.png`,
      startAt: 0,
    };
  }),
};
