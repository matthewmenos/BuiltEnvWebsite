import type { VercelRequest, VercelResponse } from '@vercel/node';
import { galleryImages as galleryTable } from '../../lib/db';
import { handleResource } from '../../lib/resource';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  return handleResource(req, res, {
    table: galleryTable,
    defaultLimit: 50,
    required: ['title', 'description', 'imageUrl'],
    buildValues: (body) => ({
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      credit: body.credit || '',
      featured: body.featured || false,
    }),
  });
}
