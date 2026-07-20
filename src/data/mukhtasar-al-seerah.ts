export const MEDIA_BASE_URL = "https://media.sabeelalrashad.com";
const AUDIO_PATH = `${MEDIA_BASE_URL}/asaad-al-zaatari/mukhtasar-al-seerah`;

const lessons = [
  { title: "الدرس الأول", fileName: "001.m4a" },
  { title: "الدرس الثاني", fileName: "002.aac" },
  { title: "الدرس الثالث", fileName: "003.m4a" },
  { title: "الدرس الرابع", fileName: "004.m4a" },
  { title: "الدرس الخامس", fileName: "005.m4a" },
  { title: "الدرس السادس", fileName: "006.m4a" },
] as const;

export const mukhtasarAlSeerahBook = {
  slug: "mukhtasar-al-seerah",
  title: "شرح مختصر السيرة",
  shortTitle: "مختصر السيرة",
  sheikh: "فضيلة الشيخ أسعد بن فتحي الزعتري",
  sheikhSlug: "asaad-al-zaatari",
  cover: "/images/courses/mukhtasar-al-seerah/000.png",
  coverImage: "/images/courses/mukhtasar-al-seerah/000.png",
  lessonsCount: 6,
  lessons: lessons.map((lesson, index) => {
    const lessonNumber = index + 1;
    const fileNumber = String(lessonNumber).padStart(3, "0");

    return {
      number: lessonNumber,
      title: lesson.title,
      audioUrl: `${AUDIO_PATH}/${lesson.fileName}`,
      image: `/images/courses/mukhtasar-al-seerah/${fileNumber}.png`,
      coverImage: `/images/courses/mukhtasar-al-seerah/${fileNumber}.png`,
      startAt: 0,
    };
  }),
};
