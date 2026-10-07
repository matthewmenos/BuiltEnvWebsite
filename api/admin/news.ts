import type { VercelRequest, VercelResponse } from '@vercel/node';
import { news as newsTable } from '../../lib/db';
import { handleResource } from '../../lib/resource';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  return handleResource(req, res, {
    table: newsTable,
    defaultLimit: 20,
    required: ['title', 'summary', 'body', 'author', 'category'],
    buildValues: (body) => ({
      title: body.title,
      summary: body.summary,
      body: body.body,
      author: body.author,
      category: body.category,
      image: body.image || '',
    }),
  });
}
