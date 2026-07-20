import { readFile } from "node:fs/promises";

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

const viewer = await readFile("public/pdfjs/web/viewer.mjs", "utf8");
if (!viewer.includes(`pdfjsVersion = ${pinnedVersion}`)) {
  throw new Error(`The official viewer does not match pdfjs-dist ${pinnedVersion}.`);
}

console.log(`Verified PDF.js viewer and worker version ${pinnedVersion}.`);
