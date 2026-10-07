import { signToken, verifyToken } from '../../auth';

export async function handleRequest(req: any, res: any): Promise<void> {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = await readBody(req);
      const { token } = body;

      if (!token) {
        res.writeHead(400).end(JSON.stringify({ error: 'Token required' }));
        return;
      }

      // Verify token to ensure it's valid
      verifyToken(token);

      // In a real app, you'd invalidate the token in Redis/DB
      // For MVP, we just return success
      res.writeHead(200).end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(401).end(JSON.stringify({ error: 'Invalid or expired token' }));
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
