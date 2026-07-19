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

## Cloudflare PDF Reader Setup

The document reader loads PDFs directly from the Cloudflare R2 custom domains.
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

Do not set `Content-Disposition: attachment` on every PDF response, because
normal PDF URLs must remain inline for the reader.

PDF.js also requires CORS on both R2 buckets, `sabeel-alrashad-books` and
`sabeel-alrashad-articles`:

```json
[
  {
    "AllowedOrigins": [
      "https://sabeelalrashad.com",
      "https://www.sabeelalrashad.com",
      "http://localhost:3000",
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
