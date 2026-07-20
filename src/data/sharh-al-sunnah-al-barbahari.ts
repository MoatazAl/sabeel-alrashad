export const MEDIA_BASE_URL = "https://media.sabeelalrashad.com";

const AUDIO_PATH =
  `${MEDIA_BASE_URL}/saad-al-zaatari/sharh-al-sunnah-al-barbahari`;
const COVER_IMAGE = "/images/courses/sharh-al-sunnah-al-barbahari/000.png";
const LESSON_COUNT = 39;
const MP3_LESSONS = new Set([20, 25, 32]);

export const sharhAlSunnahAlBarbahariBook = {
  slug: "sharh-al-sunnah-al-barbahari",
  title: "شرح السنة للبربهاري",
  sheikh: "فضيلة الشيخ سعد بن فتحي الزعتري",
  sheikhSlug: "saad-al-zaatari",
  author: "الإمام الحسن بن علي البربهاري",
  category: "العقيدة",
  description: "دروس صوتية في شرح السنة للإمام البربهاري.",
  cover: COVER_IMAGE,
  coverImage: COVER_IMAGE,
  lessonsCount: LESSON_COUNT,
  lessons: Array.from({ length: LESSON_COUNT }, (_, index) => {
    const lessonNumber = index + 1;
    const fileNumber = String(lessonNumber).padStart(3, "0");
    const extension = MP3_LESSONS.has(lessonNumber) ? "mp3" : "m4a";
    const lessonImage =
      `/images/courses/sharh-al-sunnah-al-barbahari/${fileNumber}.png`;

    return {
      number: lessonNumber,
      title: `الدرس ${lessonNumber}`,
      audioUrl: `${AUDIO_PATH}/${fileNumber}.${extension}`,
      image: lessonImage,
      coverImage: lessonImage,
      startAt: 0,
    };
  }),
};
