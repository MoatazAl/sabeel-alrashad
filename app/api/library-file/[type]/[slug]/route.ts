import { getLibraryItem } from "@/lib/library-items";

const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "etag",
  "last-modified",
  "cache-control",
] as const;

type LibraryFileRouteContext = {
  params: Promise<{
    type: string;
    slug: string;
  }>;
};

async function streamLibraryFile(
  request: Request,
  { params }: LibraryFileRouteContext,
) {
  const { type, slug } = await params;
  const item = getLibraryItem(type, slug);

  if (!item) {
    return new Response("Library file not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const upstreamRequestHeaders = new Headers();
  const range = request.headers.get("range");
  if (range) upstreamRequestHeaders.set("Range", range);

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(item.fileUrl, {
      method: request.method === "HEAD" ? "HEAD" : "GET",
      headers: upstreamRequestHeaders,
      cache: "no-store",
      signal: request.signal,
    });
  } catch {
    return new Response("Unable to fetch library file", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const responseHeaders = new Headers();
  for (const headerName of FORWARDED_RESPONSE_HEADERS) {
    const value = upstreamResponse.headers.get(headerName);
    if (value) responseHeaders.set(headerName, value);
  }

  if (
    upstreamResponse.status === 206 &&
    !responseHeaders.has("Accept-Ranges")
  ) {
    responseHeaders.set("Accept-Ranges", "bytes");
  }

  responseHeaders.set(
    "Content-Disposition",
    upstreamResponse.headers.get("content-disposition") ?? "inline",
  );

  return new Response(
    request.method === "HEAD" ? null : upstreamResponse.body,
    {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    },
  );
}

export function GET(request: Request, context: LibraryFileRouteContext) {
  return streamLibraryFile(request, context);
}

export function HEAD(request: Request, context: LibraryFileRouteContext) {
  return streamLibraryFile(request, context);
}
