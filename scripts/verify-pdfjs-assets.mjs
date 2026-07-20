import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const OFFICIAL_VIEWER_SHA256 = {
  "5.7.284": "7a4f3cc69047a98057d72a69cb16212159c500e230cef3c9e54a9ecd339903d3",
};

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const pinnedVersion = packageJson.dependencies?.["pdfjs-dist"];

if (!pinnedVersion || !/^\d+\.\d+\.\d+$/.test(pinnedVersion)) {
  throw new Error("pdfjs-dist must be pinned to an exact version.");
}

const installedPackage = JSON.parse(
  await readFile("node_modules/pdfjs-dist/package.json", "utf8")
);

if (installedPackage.version !== pinnedVersion) {
  throw new Error(
    `Installed pdfjs-dist ${installedPackage.version} does not match ${pinnedVersion}.`
  );
}

const mirroredBuildFiles = ["pdf.mjs", "pdf.sandbox.mjs", "pdf.worker.mjs"];

for (const fileName of mirroredBuildFiles) {
  const [installedFile, publicFile] = await Promise.all([
    readFile(`node_modules/pdfjs-dist/build/${fileName}`),
    readFile(`public/pdfjs/build/${fileName}`),
  ]);

  if (!installedFile.equals(publicFile)) {
    throw new Error(
      `public/pdfjs/build/${fileName} does not match installed pdfjs-dist ${pinnedVersion}.`
    );
  }
}

const viewerFile = await readFile("public/pdfjs/web/viewer.mjs");
const normalizedViewerFile =
  viewerFile.at(-1) === 0x0a ? viewerFile.subarray(0, -1) : viewerFile;
const viewerHash = createHash("sha256").update(normalizedViewerFile).digest("hex");
const officialViewerHash = OFFICIAL_VIEWER_SHA256[pinnedVersion];

if (!officialViewerHash || viewerHash !== officialViewerHash) {
  throw new Error(
    `public/pdfjs/web/viewer.mjs is not the official ${pinnedVersion} viewer.`,
  );
}

const viewer = viewerFile.toString("utf8");
if (!viewer.includes(`pdfjsVersion = ${pinnedVersion}`)) {
  throw new Error(`The official viewer does not match pdfjs-dist ${pinnedVersion}.`);
}
if (
  viewer.includes("SABEEL_PDF_ORIGINS") ||
  viewer.includes("sabeel:pdfjs-status")
) {
  throw new Error("The official PDF.js viewer must not contain local security patches.");
}

console.log(`Verified PDF.js viewer and worker version ${pinnedVersion}.`);
