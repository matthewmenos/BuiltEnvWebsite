import { env } from '../../env';
import {
  contacts as contactsTable,
  db,
} from '../../database';
import { generateId } from '../../auth';

export async function handleRequest(req: any, res: any): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200).end();
    return;
  }

  // Public endpoint (no auth required for contact form)
  if (req.method === 'GET') {
    // Return existing contacts (paginated)
    try {
      const { searchParams } = new URL(req.url || '', `http://${req.headers.host}`);
      const limit = parseInt(searchParams.get('limit') || '50', 10);
      const page = parseInt(searchParams.get('page') || '1', 10);
      const offset = (page - 1) * limit;

      const [{ count: total }] = await db
        .select({ count: contactsTable.id.length })
        .from(contactsTable);

      const rows = await db
        .select()
        .from(contactsTable)
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
  } else if (req.method === 'POST') {
    // Create a new contact submission
    try {
      const body = await readBody(req);
      const { name, email, subject, message } = body;

      if (!name || !email || !subject || !message) {
        res.writeHead(400).end(JSON.stringify({ error: 'Missing required fields' }));
        return;
      }

      const ipAddress =
        req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const [newContact] = await db
        .insert(contactsTable)
        .values({
          id: generateId(),
          name,
          email,
          subject,
          message,
          ipAddress: ipAddress.toString(),
          userAgent,
        })
        .returning();

      res.writeHead(201).end(JSON.stringify({ item: newContact, message: 'Submitted successfully' }));
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
