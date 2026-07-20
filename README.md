This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## PDF.js and Cloudflare R2 setup

The document reader self-hosts Mozilla's official generic PDF.js viewer under
`/pdfjs/web/viewer.html` and loads PDFs directly from the Cloudflare R2 custom
domains. The `pdfjs-dist` dependency is pinned exactly, and `npm run build`
checks that the public API, sandbox, and worker files are byte-for-byte matches
for that installed version.

Inline reading must keep the normal PDF URLs unchanged. Direct downloads use
the same URL with `?download=1`, so Cloudflare needs a Response Header
Transform Rule only for those download requests:

```txt
(
  http.host in {
    "books.sabeelalrashad.com"
    "articles.sabeelalrashad.com"
  }
  and http.request.uri.query contains "download=1"
)
```

Set this response header for matching requests:

```txt
Content-Disposition: attachment
```

Every stored PDF must use this object metadata on its normal URL:

```txt
Content-Type: application/pdf
Content-Disposition: inline
```

Do not set `Content-Disposition: attachment` on every PDF response. Only the
`?download=1` transform shown above should replace `inline` with `attachment`.
If the existing objects do not have this metadata, add a normal-PDF Response
Header Transform Rule before the download rule:

```txt
(
  http.host in {
    "books.sabeelalrashad.com"
    "articles.sabeelalrashad.com"
  }
  and ends_with(http.request.uri.path, ".pdf")
  and not http.request.uri.query contains "download=1"
)
```

Set `Content-Type` to `application/pdf` and `Content-Disposition` to `inline`.

PDF.js also requires CORS on both R2 buckets, `sabeel-alrashad-books` and
`sabeel-alrashad-articles`:

```json
[
  {
    "AllowedOrigins": [
      "https://sabeelalrashad.com",
      "https://www.sabeelalrashad.com",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://192.168.33.44:3000",
      "http://192.168.1.28:3000"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["Range"],
    "ExposeHeaders": [
      "Accept-Ranges",
      "Content-Length",
      "Content-Range",
      "ETag"
    ],
    "MaxAgeSeconds": 86400
  }
]
```

The same policy is available in Wrangler's current schema at
`cloudflare/r2-cors.json`. Apply it to both buckets with an authenticated
Wrangler session:

```bash
npx wrangler r2 bucket cors set sabeel-alrashad-books --file cloudflare/r2-cors.json
npx wrangler r2 bucket cors set sabeel-alrashad-articles --file cloudflare/r2-cors.json
```

Purge cached files for both custom hostnames after changing CORS or response
headers so old responses without the new headers are not retained.

Run `npm run verify:r2-pdfs` to check both production origins, both methods,
the Range request header, exposed range headers, and the response metadata of
every PDF listed in `data/library-items.ts`.
