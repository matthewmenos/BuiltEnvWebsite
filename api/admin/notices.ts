import type { VercelRequest, VercelResponse } from '@vercel/node';
import { notices as noticesTable } from '../../lib/db';
import { handleResource } from '../../lib/resource';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  return handleResource(req, res, {
    table: noticesTable,
    defaultLimit: 50,
    required: ['title', 'body', 'author'],
    buildValues: (body) => ({
      title: body.title,
      body: body.body,
      author: body.author,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    }),
  });
}
