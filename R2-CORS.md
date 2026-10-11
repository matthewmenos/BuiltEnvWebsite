# R2 CORS policy for direct browser uploads

## The error

The admin panel (e.g. **Admin → Resource Files → Add New File**) uploads files
**directly from the browser to Cloudflare R2** using a short-lived presigned
`PUT` URL (see `frontends/src/lib/upload.ts` and `lib/r2.ts`). Because the
browser is posting from `https://builtenv.vercel.app` to a *different* origin
(`https://<ACCOUNT_ID>.r2.cloudflarestorage.com`), it first sends a CORS
preflight (`OPTIONS`). If the R2 bucket has no CORS policy allowing that origin,
the browser blocks the upload and you see:

```
Access to fetch at 'https://….r2.cloudflarestorage.com/…' from origin
'https://builtenv.vercel.app' has been blocked by CORS policy: No
'Access-Control-Allow-Origin' header is present …
PUT https://….r2.cloudflarestorage.com/… net::ERR_FAILED
```

The presigned URL itself is valid — this is purely a missing **bucket CORS
policy**. It is configured on Cloudflare, not in code.

> Interim workaround (already built in): files **≤ 3 MB** automatically retry
> through the same-origin server proxy, which is immune to R2 CORS. So small
> uploads work even before you apply the policy below. Larger files require the
> CORS policy.

## Fix — apply the CORS policy to the bucket

The config lives in [`r2-cors.json`](./r2-cors.json). Use the production bucket
name from your `R2_BUCKET` env var (e.g. `builtenv`).

### Option A — wrangler CLI (matches `r2-cors.json` as-is)

```bash
# once: npm i -g wrangler   (or use npx)
wrangler r2 bucket cors set builtenv --file r2-cors.json

# verify
wrangler r2 bucket cors list builtenv
```

> `wrangler r2 bucket cors set` requires the **lowercase** format
> (`rules[].allowed.{origins,methods,headers}`) and will reject the AWS-style
> `AllowedOrigins`/`AllowedMethods` keys.

### Option B — Cloudflare dashboard

1. [Cloudflare dashboard](https://dash.cloudflare.com) → **R2** → select the
   bucket → **Settings** tab → **CORS policy** → **Add CORS policy**.
2. The dashboard editor uses the AWS-style field names. Paste this equivalent
   (same rules, different keys):

```json
[
  {
    "AllowedOrigins": [
      "https://builtenv.vercel.app",
      "https://*.vercel.app",
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["Content-Length", "ETag"],
    "MaxAgeSeconds": 86400
  }
]
```

3. Save. Propagation can take up to ~30 seconds.

## What each rule does

| Field | Value | Why |
| --- | --- | --- |
| `origins` | production + `*.vercel.app` + localhost:5173 | The site origin(s) allowed to upload. `https://*.vercel.app` also covers Vercel **preview** deployments; remove it to lock uploads to production only. `localhost:5173` is the Vite dev server. |
| `methods` | `PUT`, `GET`, `HEAD` | `PUT` is the direct upload. `GET`/`HEAD` are future-proofing for reading objects straight from R2. |
| `headers` | `*` | Covers `Content-Type` and the `x-amz-*` SigV4 headers aws4fetch may send. |
| `expose_headers` | `Content-Length`, `ETag` | Lets browser JS read these response headers if ever needed. |
| `max_age_seconds` | `86400` | Caches the preflight for a day so browsers don't re-preflight every upload. |

## Verify

1. Apply the policy (option A or B).
2. Hard-reload the admin page and upload a file **> 3 MB** (to confirm the real
   direct-to-R2 path, not the proxy fallback).
3. In DevTools → **Network**, the `OPTIONS` preflight and the `PUT` to
   `*.r2.cloudflarestorage.com` should now return
   `access-control-allow-origin: https://builtenv.vercel.app` and a `200`.

## Troubleshooting

- **Still blocked?** Check the preflight in DevTools → Network: the `Origin`
  request header must exactly match an entry in `AllowedOrigins` (scheme + host,
  no trailing slash). `https://builtenv.vercel.app` ≠ `http://builtenv.vercel.app`
  ≠ `https://www.builtenv.vercel.app`.
- **Preview deployments?** They use URLs like
  `https://builtenv-git-<branch>-<team>.vercel.app`. The `https://*.vercel.app`
  origin covers them; without it they'll fall back to the ≤3 MB proxy path.
- **Wrong bucket?** The policy must be applied to the bucket named in
  `R2_BUCKET`. Confirm with `wrangler r2 bucket list`.
- **Errors after >30s?** CORS changes occasionally take up to 30 seconds to
  propagate. Also confirm the upload URL's host matches your `R2_ACCOUNT_ID`.