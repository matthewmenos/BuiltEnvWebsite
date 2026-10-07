import { env } from '../../env';
import {
  notices as noticesTable,
  db,
} from '../../database';
import { generateId, signToken, verifyToken } from '../../auth';

export async function handleRequest(req: any, res: any): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200).end();
    return;
  }

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

    const [{ count: total }] = await db
      .select({ count: noticesTable.id.length })
      .from(noticesTable);

    const rows = await db
      .select()
      .from(noticesTable)
      .limit(limit)
      .offset(offset);

    res.writeHead(200).end(
      JSON.stringify({
        items: rows,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      })
    );
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: 'Internal server error' }));
  }
}

async function handlePost(req: any, res: any): Promise<void> {
  try {
    const body = await readBody(req);
    const { title, body: content, author, expiresAt } = body;

    if (!title || !content || !author) {
      res.writeHead(400).end(JSON.stringify({ error: 'Missing required fields' }));
      return;
    }

    const [newNotice] = await db
      .insert(noticesTable)
      .values({
        id: generateId(),
        title,
        body: content,
        author,
        expiresAt,
      })
      .returning();

    res.writeHead(201).end(JSON.stringify({ item: newNotice }));
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
