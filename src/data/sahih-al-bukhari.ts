import sectionRanges from "../../data/sahih-al-bukhari-sections.json";

export const MEDIA_BASE_URL = "https://media.sabeelalrashad.com";

const LESSON_COUNT = 148;
const AAC_LESSONS = new Set([18, 41, 76, 80]);

function getLessonSection(lessonNumber: number) {
  const range = sectionRanges.find(
    ({ start, end }) => lessonNumber >= start && lessonNumber <= end
  );

  if (!range) {
    throw new Error(`Missing Sahih al-Bukhari section for lesson ${lessonNumber}`);
  }

  return range.titles.join(" — ");
}

export const sahihAlBukhariBook = {
  slug: "sahih-al-bukhari",
  title: "شرح صحيح البخاري",
  sheikh: "فضيلة الشيخ أسعد بن فتحي الزعتري",
  sheikhSlug: "asaad-al-zaatari",
  author: "الإمام محمد بن إسماعيل البخاري",
  category: "الحديث",
  description: "دروس صوتية في شرح صحيح الإمام البخاري.",
  cover: "/images/courses/sahih-al-bukhari/000.png",
  coverImage: "/images/courses/sahih-al-bukhari/000.png",
  lessonsCount: LESSON_COUNT,
  lessons: Array.from({ length: LESSON_COUNT }, (_, index) => {
    const lessonNumber = index + 1;
    const fileNumber = String(lessonNumber).padStart(3, "0");
    const extension = AAC_LESSONS.has(lessonNumber) ? "aac" : "m4a";

    return {
      number: lessonNumber,
      title: `الدرس ${lessonNumber}`,
      section: getLessonSection(lessonNumber),
      audioUrl: `${MEDIA_BASE_URL}/sahih-al-bukhari/${fileNumber}.${extension}`,
      image: `/images/courses/sahih-al-bukhari/${fileNumber}.png`,
      coverImage: `/images/courses/sahih-al-bukhari/${fileNumber}.png`,
      startAt: 0,
    };
  }),
};
