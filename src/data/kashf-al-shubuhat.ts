export const MEDIA_BASE_URL = "https://media.sabeelalrashad.com";
const AUDIO_PATH = `${MEDIA_BASE_URL}/asaad-al-zaatari/kashf-al-shubuhat`;

const titles = [
  "الدرس الأول",
  "الدرس الثاني",
  "الدرس الثالث",
  "الدرس الرابع",
  "الدرس الخامس",
  "الدرس السادس",
  "الدرس السابع",
] as const;

const audioExtensions = [
  "m4a",
  "m4a",
  "m4a",
  "aac",
  "m4a",
  "m4a",
  "m4a",
] as const;

export const kashfAlShubuhatBook = {
  slug: "kashf-al-shubuhat",
  title: "شرح كشف الشبهات",
  sheikh: "فضيلة الشيخ أسعد بن فتحي الزعتري",
  sheikhSlug: "asaad-al-zaatari",
  description: "دروس صوتية في شرح كشف الشبهات.",
  coverImage: "/images/courses/kashf-al-shubuhat/000.png",
  lessonsCount: 7,
  lessons: titles.map((title, index) => {
    const lessonNumber = index + 1;
    const fileNumber = String(lessonNumber).padStart(3, "0");
    const extension = audioExtensions[index];

    return {
      number: lessonNumber,
      title,
      audioUrl: `${AUDIO_PATH}/${fileNumber}.${extension}`,
      coverImage: `/images/courses/kashf-al-shubuhat/${fileNumber}.png`,
      startAt: 0,
    };
  }),
};
