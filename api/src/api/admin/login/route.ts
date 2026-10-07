import { signToken, verifyPassword, hashPassword } from '../../auth';
import { env } from '../../env';
import { timingSafeEqual } from 'crypto';

// Lazily-hashed bootstrap admin from plaintext env password.
// The plaintext password is hashed once at boot (bcrypt, cost 12) and only
// the hash is kept in memory for constant-time comparison afterwards.
let adminPasswordHash: Promise<string> | undefined;
function getAdminPasswordHash(): Promise<string> {
  return (adminPasswordHash ??= hashPassword(env.adminPassword));
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function handleRequest(req: any, res: any): Promise<void> {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = await readBody(req);
      const { email, password } = body;

      if (!email || !password) {
        res.writeHead(400).end(JSON.stringify({ error: 'Email and password required' }));
        return;
      }

      // Bootstrap admin from env: ADMIN_EMAIL + ADMIN_PASSWORD.
      // The plaintext password from env is hashed once at boot (bcrypt) and
      // verified with constant-time comparison — never stored in code or DB.
      if (!timingSafeStringEqual(email, env.adminEmail)) {
        res.writeHead(401).end(JSON.stringify({ error: 'Invalid credentials' }));
        return;
      }

      const passwordHash = await getAdminPasswordHash();
      const valid = await verifyPassword(password, passwordHash);
      if (!valid) {
        res.writeHead(401).end(JSON.stringify({ error: 'Invalid credentials' }));
        return;
      }

      const token = signToken(email, email, 'admin');
      res.writeHead(200).end(JSON.stringify({ token, user: { email } }));
    } catch (err) {
      res.writeHead(500).end(JSON.stringify({ error: 'Internal server error' }));
    }
  } else {
    res.writeHead(405).end(JSON.stringify({ error: 'Method not allowed' }));
  }
}

async function readBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}
