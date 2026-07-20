export const MEDIA_BASE_URL = "https://media.sabeelalrashad.com";

const titles = [
  "الدرس الأول",
  "الدرس الثاني",
  "الدرس الثالث",
  "الدرس الرابع",
  "الدرس الخامس",
  "الدرس السادس",
  "الدرس السابع",
  "الدرس الثامن",
  "الدرس التاسع",
  "الدرس العاشر",
  "الدرس الحادي عشر",
  "الدرس الثاني عشر",
  "الدرس الثالث عشر",
  "الدرس الرابع عشر",
  "الدرس الخامس عشر",
  "الدرس السادس عشر",
  "الدرس السابع عشر",
  "الدرس الثامن عشر",
  "الدرس التاسع عشر",
] as const;

const audioExtensions = [
  "mp3",
  "m4a",
  "m4a",
  "m4a",
  "aac",
  "aac",
  "m4a",
  "m4a",
  "m4a",
  "m4a",
  "m4a",
  "m4a",
  "m4a",
  "m4a",
  "m4a",
  "m4a",
  "m4a",
  "m4a",
  "m4a",
] as const;

export const tadmuriyyahBook = {
  slug: "al-fatwa-al-tadmuriyyah",
  title: "شرح الفتوى التدمرية",
  sheikh: "فضيلة الشيخ أسعد الزعتري",
  sheikhSlug: "asaad-al-zaatari",
  description: "دروس صوتية في شرح الفتوى التدمرية.",
  coverImage: "/images/courses/tadmuriyyah/000.png",
  lessonsCount: 19,
  lessons: titles.map((title, index) => {
    const lessonNumber = index + 1;
    const fileNumber = String(lessonNumber).padStart(3, "0");
    const extension = audioExtensions[index];

    return {
      number: lessonNumber,
      title,
      audioUrl: `${MEDIA_BASE_URL}/asaad-al-zaatari/al-fatwa-al-tadmuriyyah/${fileNumber}.${extension}`,
      coverImage: `/images/courses/tadmuriyyah/${fileNumber}.png`,
      startAt: lessonNumber === 1 ? 15 : 0,
    };
  }),
};
