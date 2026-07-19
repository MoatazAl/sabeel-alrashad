import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const mappingPath = path.join(
  projectRoot,
  "data/sahih-al-bukhari-sections.json"
);
const outputDirectory = path.join(
  projectRoot,
  "public/images/courses/sahih-al-bukhari"
);

const WIDTH = 1600;
const HEIGHT = 900;
const EXPLAINER = "شرح فضيلة الشيخ أسعد بن فتحي الزعتري";

const palettes = [
  { background: "#211914", panel: "#2b211a", gold: "#c79a45", text: "#fff7e8", muted: "#d8c6a7" },
  { background: "#062f28", panel: "#083c32", gold: "#d0a451", text: "#f8f1df", muted: "#c9d7c7" },
  { background: "#102f33", panel: "#153d41", gold: "#c7a35a", text: "#f7f3e7", muted: "#c8d8d5" },
  { background: "#202020", panel: "#292929", gold: "#b99a5b", text: "#faf4e6", muted: "#d4c8b7" },
  { background: "#303622", panel: "#3b412c", gold: "#d0a046", text: "#fff8e7", muted: "#d9d5bd" },
];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function splitBalancedTitle(title) {
  if (title.length <= 26) return [title];

  const words = title.split(" ");
  let bestIndex = 1;
  let smallestDifference = Number.POSITIVE_INFINITY;

  for (let index = 1; index < words.length; index += 1) {
    const first = words.slice(0, index).join(" ");
    const second = words.slice(index).join(" ");
    const difference = Math.abs(first.length - second.length);

    if (difference < smallestDifference) {
      bestIndex = index;
      smallestDifference = difference;
    }
  }

  return [
    words.slice(0, bestIndex).join(" "),
    words.slice(bestIndex).join(" "),
  ];
}

function renderTitleBlocks(titles, palette) {
  const blocks = titles.map(splitBalancedTitle);
  const combined = blocks.length > 1;
  const fontSize = combined ? 82 : blocks[0].length > 1 ? 88 : 112;
  const lineHeight = fontSize * 1.45;
  const separatorSpace = combined ? 88 : 0;
  const titleHeight =
    blocks.reduce((height, lines) => height + lines.length * lineHeight, 0) +
    separatorSpace * (blocks.length - 1);
  let cursorY = 390 - titleHeight / 2 + lineHeight / 2;
  const elements = [];

  blocks.forEach((lines, blockIndex) => {
    lines.forEach((line) => {
      elements.push(`
        <text x="800" y="${cursorY}" text-anchor="middle" dominant-baseline="middle"
          direction="rtl" unicode-bidi="plaintext" fill="${palette.text}"
          font-family="Noto Sans Arabic" font-size="${fontSize}" font-weight="800">
          ${escapeXml(line)}
        </text>`);
      cursorY += lineHeight;
    });

    if (blockIndex < blocks.length - 1) {
      const separatorY = cursorY + 2;
      elements.push(`
        <line x1="600" y1="${separatorY}" x2="1000" y2="${separatorY}"
          stroke="${palette.gold}" stroke-width="2" opacity="0.9" />`);
      cursorY += separatorSpace;
    }
  });

  return elements.join("");
}

function lessonPosterSvg(titles, palette) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <defs>
        <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${palette.panel}" />
          <stop offset="1" stop-color="${palette.background}" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#background)" />
      <rect x="42" y="42" width="1516" height="816" rx="18" fill="none"
        stroke="${palette.gold}" stroke-width="3" opacity="0.9" />
      <rect x="58" y="58" width="1484" height="784" rx="13" fill="none"
        stroke="${palette.text}" stroke-width="1" opacity="0.16" />

      <line x1="530" y1="154" x2="1070" y2="154" stroke="${palette.gold}" stroke-width="2" />
      <circle cx="800" cy="154" r="6" fill="${palette.gold}" />

      ${renderTitleBlocks(titles, palette)}

      <line x1="410" y1="660" x2="1190" y2="660" stroke="${palette.gold}" stroke-width="2" opacity="0.85" />
      <text x="800" y="738" text-anchor="middle" dominant-baseline="middle"
        direction="rtl" unicode-bidi="plaintext" fill="${palette.muted}"
        font-family="Noto Sans Arabic" font-size="32" font-weight="500">
        ${EXPLAINER}
      </text>
    </svg>`;
}

function mainPosterSvg() {
  const palette = {
    background: "#1d0d11",
    panel: "#35151d",
    gold: "#c9a35c",
    text: "#fff7e8",
    muted: "#dcc9ac",
  };

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <defs>
        <linearGradient id="main-background" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${palette.panel}" />
          <stop offset="1" stop-color="${palette.background}" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#main-background)" />
      <rect x="42" y="42" width="1516" height="816" rx="18" fill="none"
        stroke="${palette.gold}" stroke-width="3" />
      <rect x="62" y="62" width="1476" height="776" rx="12" fill="none"
        stroke="${palette.text}" stroke-width="1" opacity="0.18" />
      <rect x="250" y="116" width="1100" height="668" rx="12" fill="none"
        stroke="${palette.gold}" stroke-width="2" opacity="0.62" />

      <line x1="560" y1="226" x2="1040" y2="226" stroke="${palette.gold}" stroke-width="2" />
      <circle cx="800" cy="226" r="7" fill="${palette.gold}" />

      <text x="800" y="422" text-anchor="middle" dominant-baseline="middle"
        direction="rtl" unicode-bidi="plaintext" fill="${palette.text}"
        font-family="Noto Naskh Arabic" font-size="154" font-weight="700">
        صحيح البخاري
      </text>

      <line x1="470" y1="548" x2="1130" y2="548" stroke="${palette.gold}" stroke-width="2" opacity="0.86" />
      <text x="800" y="636" text-anchor="middle" dominant-baseline="middle"
        direction="rtl" unicode-bidi="plaintext" fill="${palette.muted}"
        font-family="Noto Sans Arabic" font-size="42" font-weight="500">
        للإمام أبي عبد الله محمد بن إسماعيل البخاري
      </text>
    </svg>`;
}

async function renderPng(svg) {
  return sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function main() {
  const ranges = JSON.parse(await readFile(mappingPath, "utf8"));
  const assignedLessons = new Set();

  for (const range of ranges) {
    if (
      !Number.isInteger(range.start) ||
      !Number.isInteger(range.end) ||
      range.start < 1 ||
      range.end > 148 ||
      range.start > range.end ||
      !Array.isArray(range.titles) ||
      range.titles.length < 1
    ) {
      throw new Error(`Invalid poster range: ${JSON.stringify(range)}`);
    }

    for (let lesson = range.start; lesson <= range.end; lesson += 1) {
      if (assignedLessons.has(lesson)) {
        throw new Error(`Lesson ${lesson} appears in more than one poster range`);
      }
      assignedLessons.add(lesson);
    }
  }

  if (assignedLessons.size !== 148) {
    const missing = Array.from({ length: 148 }, (_, index) => index + 1).filter(
      (lesson) => !assignedLessons.has(lesson)
    );
    throw new Error(`Poster mapping is incomplete. Missing: ${missing.join(", ")}`);
  }

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    path.join(outputDirectory, "000.png"),
    await renderPng(mainPosterSvg())
  );

  for (const [rangeIndex, range] of ranges.entries()) {
    const palette = palettes[rangeIndex % palettes.length];
    const poster = await renderPng(lessonPosterSvg(range.titles, palette));

    for (let lesson = range.start; lesson <= range.end; lesson += 1) {
      const fileNumber = String(lesson).padStart(3, "0");
      await writeFile(path.join(outputDirectory, `${fileNumber}.png`), poster);
    }
  }

  console.log(`Generated 149 posters in ${outputDirectory}`);
}

await main();
