import { Sheikh, Series } from "@/lib/types";

export const sheikhs: Sheikh[] = [
  {
    slug: "asad-zaatari",
    name: "الشيخ أسعد الزعتري",
    bio: "دروس ومحاضرات وشروح علمية منشورة في قنوات ومكتبات دعوية على يوتيوب.",
  },
  {
    slug: "saad-zaatari",
    name: "الشيخ سعد الزعتري",
    bio: "سلاسل علمية ودروس ولقاءات منشورة في عدد من القنوات الدعوية.",
  },
  {
    slug: "raed-mahdawi",
    name: "الشيخ رائد المهداوي",
    bio: "شروح علمية ومجالس ودروس متنوعة متاحة عبر قوائم تشغيل وقنوات متعددة.",
  },
];

export const seriesList: Series[] = [
  {
    slug: "asad-main-playlist",
    sheikhSlug: "asad-zaatari",
    title: "الشيخ أسعد الزعتري",
    description: "قائمة تشغيل عامة تضم دروسًا ومحاضرات متنوعة للشيخ أسعد الزعتري.",
    playlistUrl: "https://www.youtube.com/playlist?list=PLsUv22znyHyjNJ6JqSAFPXUfljoXDL9Mn",
    sourceLabel: "يوتيوب",
  },
  {
    slug: "asad-tahawiyyah",
    sheikhSlug: "asad-zaatari",
    title: "شرح العقيدة الطحاوية",
    description: "سلسلة شرح في العقيدة الطحاوية.",
    playlistUrl: "https://www.youtube.com/playlist?list=PLKkUHLIFlz-qDNzIGPQyNWUx2rxIMx4wV",
    sourceLabel: "يوتيوب",
  },
  {
    slug: "asad-sawt-al-sunnah",
    sheikhSlug: "asad-zaatari",
    title: "دروس أسعد الزعتري في صوت السنة",
    description: "مواد علمية متنوعة، ومنها شرح كتاب التوحيد وشرح صحيح البخاري ضمن قوائم قناة صوت السنة في فلسطين.",
    playlistUrl: "https://www.youtube.com/c/palsunna/playlists",
    sourceLabel: "قناة صوت السنة في فلسطين",
  },

  {
    slug: "saad-main-playlist",
    sheikhSlug: "saad-zaatari",
    title: "الشيخ سعد الزعتري",
    description: "قائمة تشغيل عامة تضم دروسًا ومحاضرات متنوعة للشيخ سعد الزعتري.",
    playlistUrl: "https://www.youtube.com/playlist?list=PLsUv22znyHyj9azrk21KUcQD5f5ZzCOpO",
    sourceLabel: "يوتيوب",
  },
  {
    slug: "saad-umdat-al-ahkam-hajj",
    sheikhSlug: "saad-zaatari",
    title: "شرح عمدة الأحكام – كتاب الحج",
    description: "شرح لأبواب الحج من عمدة الأحكام.",
    playlistUrl: "https://www.youtube.com/playlist?list=PLKkUHLIFlz-rqHsAyejXiXg9Jg-2CIyBH",
    sourceLabel: "يوتيوب",
  },
  {
    slug: "saad-tafsir-al-saadi",
    sheikhSlug: "saad-zaatari",
    title: "شرح تفسير السعدي",
    description: "سلسلة تفسيرية منشورة على يوتيوب.",
    playlistUrl: "https://www.youtube.com/playlist?list=PLKkUHLIFlz-q-KRBJ5dF4Ue_vnahcUIkh",
    sourceLabel: "يوتيوب",
  },

  {
    slug: "raed-main-playlist",
    sheikhSlug: "raed-mahdawi",
    title: "الشيخ رائد المهداوي",
    description: "قائمة تشغيل عامة تضم مواد متنوعة للشيخ رائد المهداوي.",
    playlistUrl: "https://www.youtube.com/playlist?list=PLsUv22znyHyjkUW-u_1d58CO49Shi05dq",
    sourceLabel: "يوتيوب",
  },
  {
    slug: "raed-ajrumiyyah",
    sheikhSlug: "raed-mahdawi",
    title: "شرح الآجرومية",
    description: "سلسلة في شرح الآجرومية.",
    playlistUrl: "https://www.youtube.com/playlist?list=PLKkUHLIFlz-oq3UX2lsjfHBoKGTXv1g5B",
    sourceLabel: "يوتيوب",
  },
  {
    slug: "raed-usul-al-sunnah",
    sheikhSlug: "raed-mahdawi",
    title: "شرح أصول السنة",
    description: "سلسلة شرح أصول السنة للإمام أحمد بن حنبل.",
    playlistUrl: "https://www.youtube.com/playlist?list=PLKkUHLIFlz-rWPeHYGu3FUmo692w_eE5G",
    sourceLabel: "يوتيوب",
  },
];