import { readFile } from "node:fs/promises";

const SITE_ORIGINS = [
  "https://sabeelalrashad.com",
  "https://www.sabeelalrashad.com",
];
const REQUIRED_METHODS = ["GET", "HEAD"];
const REQUIRED_EXPOSED_HEADERS = [
  "accept-ranges",
  "content-length",
  "content-range",
];
const BUCKET_ORIGINS = {
  bookUrl: "https://books.sabeelalrashad.com",
  articleUrl: "https://articles.sabeelalrashad.com",
};

function headerTokens(value) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean)
  );
}

const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

const librarySource = await readFile("data/library-items.ts", "utf8");
const itemPattern = /fileUrl:\s*(bookUrl|articleUrl)\("([^"]+\.pdf)"\)/g;
const documents = [...librarySource.matchAll(itemPattern)].map((match) => ({
  kind: match[1],
  url: `${BUCKET_ORIGINS[match[1]]}/raed-al-mahdawi/${match[2]}`,
}));

if (documents.length === 0) throw new Error("No library PDFs were found to verify.");

for (const bucketOrigin of Object.values(BUCKET_ORIGINS)) {
  const sample = documents.find((document) => document.url.startsWith(bucketOrigin));
  if (!sample) throw new Error(`No PDF was found for ${bucketOrigin}.`);

  for (const siteOrigin of SITE_ORIGINS) {
    for (const method of REQUIRED_METHODS) {
      const response = await fetch(sample.url, {
        method: "OPTIONS",
        headers: {
          Origin: siteOrigin,
          "Access-Control-Request-Method": method,
          "Access-Control-Request-Headers": "Range",
        },
      });
      const allowedMethods = headerTokens(
        response.headers.get("access-control-allow-methods")
      );
      const allowedHeaders = headerTokens(
        response.headers.get("access-control-allow-headers")
      );

      check(response.ok, `${bucketOrigin} rejected the ${method} preflight.`);
      check(
        response.headers.get("access-control-allow-origin") === siteOrigin,
        `${bucketOrigin} does not allow origin ${siteOrigin}.`
      );
      check(
        allowedMethods.has(method.toLowerCase()),
        `${bucketOrigin} does not allow ${method}.`
      );
      check(
        allowedHeaders.has("range"),
        `${bucketOrigin} does not allow the Range request header.`
      );
    }

    const rangeResponse = await fetch(sample.url, {
      headers: { Origin: siteOrigin, Range: "bytes=0-0" },
    });
    const exposedHeaders = headerTokens(
      rangeResponse.headers.get("access-control-expose-headers")
    );

    check(
      rangeResponse.status === 206,
      `${bucketOrigin} did not honor a byte-range request (status ${rangeResponse.status}).`
    );
    check(
      rangeResponse.headers.get("access-control-allow-origin") === siteOrigin,
      `${bucketOrigin} omitted CORS on a range response for ${siteOrigin}.`
    );
    for (const header of REQUIRED_EXPOSED_HEADERS) {
      check(
        exposedHeaders.has(header),
        `${bucketOrigin} does not expose ${header}.`
      );
    }
  }
}

for (const document of documents) {
  const response = await fetch(document.url, {
    method: "HEAD",
    headers: { Origin: SITE_ORIGINS[0] },
  });
  const contentType = response.headers.get("content-type") ?? "";
  const contentDisposition = response.headers.get("content-disposition") ?? "";

  check(response.ok, `${document.url} returned status ${response.status}.`);
  check(
    contentType.toLowerCase().startsWith("application/pdf"),
    `${document.url} has Content-Type: ${contentType || "<missing>"}.`
  );
  check(
    /^inline(?:;|$)/i.test(contentDisposition.trim()),
    `${document.url} has Content-Disposition: ${contentDisposition || "<missing>"}.`
  );
}

if (failures.length > 0) {
  throw new Error(`R2 verification failed:\n- ${failures.join("\n- ")}`);
}

console.log(
  `Verified CORS on both R2 buckets and PDF headers for ${documents.length} documents.`
);
