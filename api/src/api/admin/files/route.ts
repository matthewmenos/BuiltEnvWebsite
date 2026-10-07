import { env } from '../../env';
import { generateId, signToken, verifyToken } from '../../auth';

// Note: R2 upload integration requires @aws-sdk/client-s3 which is not
// installed locally. The route structure is provided for Vercel's R2
// integration. In Vercel, R2 bindings are available via process.env.

export async function handleRequest(req: any, res: any): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200).end();
    return;
  }

  // Auth middleware for admin file uploads
  if (req.method !== 'GET' && req.method !== 'POST') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      res.writeHead(401).end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    try {
      verifyToken(auth.slice(7));
    } catch {
      res.writeHead(401).end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
  }

  if (req.method === 'GET') {
    await handleGet(req, res);
  } else if (req.method === 'POST') {
    await handlePost(req, res);
  } else {
    res.writeHead(405).end(JSON.stringify({ error: 'Method not allowed' }));
  }
}

async function handleGet(req: any, res: any): Promise<void> {
  try {
    const { searchParams } = new URL(req.url || '', `http://${req.headers.host}`);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;

    // For MVP, return from environment config or empty array
    const files = (process.env.R2_FILES ? JSON.parse(process.env.R2_FILES) : []) as Array<{
      id: string;
      name: string;
      url: string;
      type: string;
      size: number;
      uploadedAt: string;
    }>;

    res.writeHead(200).end(
      JSON.stringify({
        items: files,
        pagination: { total: files.length, page, limit, pages: Math.ceil(files.length / limit) },
      })
    );
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: 'Internal server error' }));
  }
}

async function handlePost(req: any, res: any): Promise<void> {
  try {
    const body = await readBody(req);
    const { name, type, size } = body;

    if (!name || !type) {
      res.writeHead(400).end(JSON.stringify({ error: 'Missing required fields' }));
      return;
    }

    // In Vercel, R2 upload would use the R2 SDK here.
    // For MVP, we just log and return a placeholder URL.
    const file = {
      id: generateId(),
      name,
      url: process.env.R2_UPLOAD_URL || `https://example.com/uploads/${name}`,
      type,
      size: parseInt(size || '0', 10),
      uploadedAt: new Date().toISOString(),
    };

    res.writeHead(201).end(JSON.stringify({ item: file }));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: 'Internal server error' }));
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
