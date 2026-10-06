# BuiltEnvWebsite

CMS-driven Department of Built Environment website (HTML/CSS/TypeScript) with a
client-side routed public site and an Admin Dashboard. Nothing on the public
site is hardcoded: every label, heading, button, placeholder, contact detail,
footer link and colour is managed in the dashboard; admin credentials live
only in server environment variables.

## Run

```bash
npm run dev        # node serve.js -> http://localhost:5173
```

No dependencies are required. The runtime entry is `index.html` -> `dist/app.js`
(the authored bundle; see "Source of truth" below).

## Admin

- Open `#/login` directly in the browser - there is deliberately no admin
  link in the public navigation or footer. (`#/admin` redirects to `#/login`
  until a session exists; after sign-in you land on the dashboard.)
- Sign-in posts to `POST /api/admin`; the dashboard receives a short-lived
  signed session token (a password is never stored in the browser). Sessions
  are re-checked with `GET /api/admin` on every admin render.
- Credentials come exclusively from environment variables - `ADMIN_USER`,
  `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` and optional `ADMIN_SESSION_HOURS`
  - set in `.env` for local dev (see `.env.example`) or in your host's
  environment in production.
- Production note: the host serving the site must expose the same
  `/api/admin` endpoint (implemented in `serve.js` for local dev). A pure
  static host cannot verify logins, so admin sign-in will fail there.

## What is managed in the dashboard

- **Settings** - branding, logo text, hero, nav/footer labels, every section
  eyebrow/title, buttons, placeholders, empty-state messages, contact details
  and topics, social links, emergency numbers, theme colours (pine/accent),
  R2 connection, security.
- **Media** - upload files to Cloudflare R2 (or add by URL); library URLs are
  offered to Gallery items and Staff photos via a picker. With `R2_UPLOAD` +
  `UPLOAD_TOKEN` in the server `.env`, uploads are proxied through
  `/api/r2` so the R2 token never reaches the browser (see `R2_SETUP.md`).
- **Programmes / Staff / Research / News / Events / Resources / Gallery /
  Inbox** - full CRUD; filters, tabs and categories derive from the data.
- **Backup** - export/import JSON, reset to seeds.

See `R2_SETUP.md` for the Cloudflare R2 + Worker setup (`worker/` folder).

## Icons & media

- Lucide icons only (loaded from unpkg in `index.html`). No emoji anywhere.
- Gallery items show an R2 image when set, otherwise a gradient tile with a
  Lucide icon name chosen per item.

## Source of truth

`dist/app.js` is the runtime bundle and is manually maintained (the TypeScript
toolchain is not installed in this environment). `src/*.ts` is an out-of-date
reference only - do not compile it over `dist/app.js`. Either keep edits to
`dist/app.js` (mirroring important changes into `src/` for documentation), or
restore the toolchain (`npm install`, `npx tsc -p tsconfig.json`) and port the
current bundle behaviour back into `src/` before enabling `npm run build`.
