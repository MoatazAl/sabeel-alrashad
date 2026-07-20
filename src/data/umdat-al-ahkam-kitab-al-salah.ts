export const MEDIA_BASE_URL = "https://media.sabeelalrashad.com";

const SLUG = "umdat-al-ahkam-kitab-al-salah";
const AUDIO_PATH = `${MEDIA_BASE_URL}/saad-al-zaatari/${SLUG}`;
const POSTER_PATH = `/images/courses/${SLUG}`;
const LESSON_COUNT = 34;

export const umdatAlAhkamKitabAlSalahBook = {
  slug: SLUG,
  title: "شرح عمدة الأحكام – كتاب الصلاة",
  sheikh: "فضيلة الشيخ سعد بن فتحي الزعتري",
  sheikhSlug: "saad-al-zaatari",
  author: "الإمام عبد الغني المقدسي",
  category: "الحديث",
  description: "دروس صوتية في شرح كتاب الصلاة من عمدة الأحكام.",
  cover: `${POSTER_PATH}/000.png`,
  coverImage: `${POSTER_PATH}/000.png`,
  lessonsCount: LESSON_COUNT,
  lessons: Array.from({ length: LESSON_COUNT }, (_, index) => {
    const lessonNumber = index + 1;
    const fileNumber = String(lessonNumber).padStart(3, "0");
    const lessonPoster = `${POSTER_PATH}/${fileNumber}.png`;

    return {
      number: lessonNumber,
      title: `الدرس ${lessonNumber}`,
      audioUrl: `${AUDIO_PATH}/${fileNumber}.mp3`,
      image: lessonPoster,
      coverImage: lessonPoster,
      startAt: 0,
    };
  }),
};
