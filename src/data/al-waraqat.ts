export const MEDIA_BASE_URL = "https://media.sabeelalrashad.com";
const AUDIO_PATH = `${MEDIA_BASE_URL}/asaad-al-zaatari/al-waraqat`;

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
] as const;

export const alWaraqatBook = {
  slug: "al-waraqat",
  title: "شرح الورقات",
  sheikh: "فضيلة الشيخ أسعد بن فتحي الزعتري",
  sheikhSlug: "asaad-al-zaatari",
  coverImage: "/images/courses/al-waraqat/000.png",
  lessonsCount: 12,
  lessons: titles.map((title, index) => {
    const lessonNumber = index + 1;
    const fileNumber = String(lessonNumber).padStart(3, "0");

    return {
      number: lessonNumber,
      title,
      audioUrl: `${AUDIO_PATH}/${fileNumber}.m4a`,
      coverImage: `/images/courses/al-waraqat/${fileNumber}.png`,
      startAt: 0,
    };
  }),
};
