# Cloudflare R2 Media Setup

This site stores all media (gallery images, staff photos) in a **Cloudflare R2
bucket** — never in `localStorage` and never as base64. Uploads go through a
small Cloudflare Worker (`worker/` folder) that authenticates with a bearer
token.

## Two ways to connect

| Mode | Where config lives | When to use |
|---|---|---|
| **Server-managed (recommended)** | `.env`: `R2_UPLOAD`, `UPLOAD_TOKEN`, `PUBLIC_BASE` | The token stays server-side; uploads go dashboard → `PUT /api/r2/<key>` → Worker, using your admin session |
| **Direct (fallback)** | Admin → Settings → Media | Static hosting without `serve.js`, or quick testing; the token is stored in this browser's `localStorage` |

Both modes use the same Worker. Use **Test connection** in **Settings →
Media** to verify the endpoint and token with one click.

## 1. Create the R2 bucket

1. Cloudflare dashboard → **R2** → create bucket, e.g. `builtenv-media`.
2. (Optional but recommended) Connect a custom domain, or use the R2 public
   URL: bucket → **Settings** → **Public development URL**
   (`https://pub-xxxxxxxx.r2.dev`).

## 2. Deploy the Worker

```bash
cd worker
npx wrangler login               # first time only
npx wrangler deploy
```

Configure it in `worker/wrangler.toml`:

| Setting | Where | Value |
|---|---|---|
| `bucket_name` | `[[r2_buckets]]` | your bucket name |
| `PUBLIC_BASE` | `[vars]` | public base URL (custom domain or `https://pub-xxx.r2.dev`) |
| `UPLOAD_TOKEN` | secret | run `npx wrangler secret put UPLOAD_TOKEN` and enter a long random token |

The Worker exposes:

- `PUT  /<key>` — stores the object (requires `Authorization: Bearer <UPLOAD_TOKEN>`)
- `DELETE /<key>` — removes the object (same auth)
- CORS headers for browser uploads from the admin dashboard

`.env.example` in the project root documents the same values plus the
server-proxy settings (`R2_UPLOAD`, `PUBLIC_BASE`, `UPLOAD_TOKEN`, `PORT`,
admin keys). For server-managed mode put `R2_UPLOAD` (the deployment URL),
`PUBLIC_BASE` and `UPLOAD_TOKEN` in your `.env` - the token must be the same
value as the Worker secret.

## 3. Enter the values in the Admin Dashboard (direct mode only)

Skip this section when using server-managed mode - the dashboard then reads
its configuration from `GET /api/r2` and these fields are only an override.

Log in to `#/login` → **Settings** → **Media (Cloudflare R2)**:

| Admin field | Matches | Example |
|---|---|---|
| Public base URL (`r2Public`) | Worker `PUBLIC_BASE` | `https://pub-xxx.r2.dev` |
| Upload endpoint (`r2Upload`) | Worker deployment URL | `https://builtenv-media.<account>.workers.dev` |
| Upload token (`r2Token`) | Worker `UPLOAD_TOKEN` secret | your long random token |

Save settings.

## 4. Upload and use media

1. **Settings → Media**: use **Test connection** to probe the endpoint (it
   uploads and then removes a tiny object), then pick a file → **Upload to
   R2**. The file is `PUT` to the Worker (directly, or via `/api/r2` when
   server-managed) and its URL is saved in the media library (you can also
   paste any public URL and **Add**).
2. **Gallery** items: set **Image (R2 URL)** (the media picker offers library
   URLs) and optionally an **Icon (Lucide name)** used when no image is set.
3. **Staff**: set **Photo (R2 URL)**; otherwise the card shows initials.
4. Deleting a media record also sends a best-effort `DELETE` to the Worker.

## Notes

- **Icons** are [Lucide](https://lucide.dev) icon names rendered as SVG — the
  site contains no emoji. Browse names on the Lucide site (e.g. `landmark`,
  `flask-conical`, `trees`, `ruler`).
- **Credentials**: no admin passwords exist in the code or in `localStorage`.
  Sign-in goes through `POST /api/admin` on the dev/production server, with
  `ADMIN_USER` / `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` configured in the
  environment (`.env` locally). In server-managed mode the R2 upload token
  also stays server-side (read by `serve.js` only); in direct mode it is a
  *client* setting (Settings → Media) stored in this browser's `localStorage`
  - it only grants `PUT`/`DELETE` on the media Worker.
- **CORS**: the Worker allows all origins (`*`) because uploads are
  protected by the bearer token. Tighten `Access-Control-Allow-Origin` in
  `worker/index.js` if you serve the site from a known origin.
- **Migration**: existing gallery/staff entries keep working — empty image
  fields simply fall back to the gradient/icon/initials styles until you add
  an R2 URL.
