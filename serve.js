// Minimal static file server for local development (no dependencies).
// Also exposes POST/GET /api/admin for dashboard sign-in; admin credentials
// come from environment / .env (ADMIN_USER, ADMIN_PASSWORD, ADMIN_SESSION_SECRET)
// and are never shipped to the browser.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

// Load .env if present (does not override real env vars).
try {
  if (existsSync('.env')) {
    for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
} catch { /* ignore */ }

const root = process.cwd();
const port = process.env.PORT ? Number(process.env.PORT) : 5173;

const ADMIN_USER = process.env.ADMIN_USER || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '';
const ADMIN_SESSION_HOURS = Math.max(1, Number(process.env.ADMIN_SESSION_HOURS) || 8);
const adminConfigured = !!(ADMIN_USER && ADMIN_PASSWORD && ADMIN_SESSION_SECRET);

// R2 media proxy (optional): when the worker endpoint + upload token are in
// env, the dashboard uploads through PUT/DELETE /api/r2/<key> with its admin
// session and the R2 token never reaches the browser. PUBLIC_BASE is used to
// build public object URLs. Direct client-side config (Settings -> Media)
// remains as a fallback when these are unset.
const R2_UPLOAD = (process.env.R2_UPLOAD || '').replace(/\/+$/, '');
const R2_TOKEN = process.env.UPLOAD_TOKEN || '';
const R2_PUBLIC = (process.env.PUBLIC_BASE || '').replace(/\/+$/, '');
const r2Managed = !!(R2_UPLOAD && R2_TOKEN);

function sha(s) { return createHash('sha256').update(String(s || '')).digest(); }
function eq(a, b) { const x = sha(a), y = sha(b); return timingSafeEqual(x, y); }
function sig(exp) { return createHmac('sha256', ADMIN_SESSION_SECRET).update('admin:' + exp).digest('hex'); }
function issueToken() { const exp = Date.now() + ADMIN_SESSION_HOURS * 3600000; return { token: exp + '.' + sig(exp), exp }; }
function tokenValid(t) {
  if (!adminConfigured || !t) return false;
  const i = t.indexOf('.'); if (i < 1) return false;
  const exp = Number(t.slice(0, i)); if (!exp || Date.now() > exp) return false;
  const a = Buffer.from(t.slice(i + 1), 'utf8'), b = Buffer.from(sig(exp), 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}
function json(res, status, obj) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); }
function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => { d += c; if (d.length > 4096) { reject(new Error('too large')); req.destroy(); } });
    req.on('end', () => resolve(d));
    req.on('error', reject);
  });
}
async function handleAdminApi(req, res) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (req.method === 'POST') {
    if (!adminConfigured) return json(res, 503, { error: 'Admin login is not configured on this server (set ADMIN_USER, ADMIN_PASSWORD, ADMIN_SESSION_SECRET).' });
    let body;
    try { body = JSON.parse((await readBody(req)) || '{}'); } catch { return json(res, 400, { error: 'Bad request.' }); }
    if (eq(body.username, ADMIN_USER) && eq(body.password, ADMIN_PASSWORD)) {
      const t = issueToken();
      return json(res, 200, { token: t.token, expiresAt: new Date(t.exp).toISOString() });
    }
    return json(res, 401, { error: 'Invalid username or password.' });
  }
  if (req.method === 'GET') {
    if (!adminConfigured) return json(res, 503, { error: 'Admin API not configured.' });
    if (!tokenValid(token)) return json(res, 401, { error: 'Unauthorized.' });
    return json(res, 200, { ok: true });
  }
  return json(res, 405, { error: 'Method not allowed.' });
}

function readBodyRaw(req, max) {
  return new Promise((resolve, reject) => {
    const chunks = []; let n = 0;
    req.on('data', c => { n += c.length; if (n > max) { reject(new Error('too large')); req.destroy(); return; } chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
async function handleR2Api(req, res, key, token) {
  if (req.method === 'GET' && !key) {
    // Config discovery for the dashboard (no secrets included).
    return json(res, 200, { ok: true, managed: r2Managed, publicBase: R2_PUBLIC });
  }
  if (!tokenValid(token)) return json(res, 401, { error: 'Unauthorized.' });
  if (!r2Managed) return json(res, 503, { error: 'R2 proxy not configured (set R2_UPLOAD and UPLOAD_TOKEN in .env).' });
  if (!key || key.includes('..')) return json(res, 400, { error: 'Missing key.' });
  if (req.method !== 'PUT' && req.method !== 'DELETE') return json(res, 405, { error: 'Method not allowed.' });
  try {
    const body = req.method === 'PUT' ? await readBodyRaw(req, 25 * 1024 * 1024) : undefined;
    const r = await fetch(R2_UPLOAD + '/' + key.replace(/^\/+/, ''), {
      method: req.method,
      headers: Object.assign({ 'Authorization': 'Bearer ' + R2_TOKEN },
        req.method === 'PUT' ? { 'Content-Type': req.headers['content-type'] || 'application/octet-stream' } : {}),
      body
    });
    const text = await r.text();
    res.writeHead(r.status, { 'Content-Type': 'application/json' });
    res.end(text || '{}');
  } catch (e) {
    json(res, 502, { error: 'R2 endpoint unreachable: ' + e.message });
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent((req.url || '/').split('?')[0]);
    if (path === '/api/admin' || path.startsWith('/api/admin/')) { await handleAdminApi(req, res); return; }
    if (path === '/api/r2' || path.startsWith('/api/r2/')) {
      const key = path.slice('/api/r2'.length).replace(/^\//, '');
      const auth = req.headers['authorization'] || '';
      await handleR2Api(req, res, key, auth.startsWith('Bearer ') ? auth.slice(7) : '');
      return;
    }
    if (path.endsWith('/')) path += 'index.html';
    const rel = normalize(path).replace(/^([/\\])+/, '');
    const file = join(root, rel);
    if (!file.startsWith(root + sep) && file !== root) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
}).listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`);
});
