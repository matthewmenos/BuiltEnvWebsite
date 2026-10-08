import type { VercelRequest, VercelResponse } from '@vercel/node';
import { homeSlides as homeSlidesTable } from '../../lib/db';
import { handleResource } from '../../lib/resource';

// Homepage hero carousel slides.
// GET is public (the homepage loads them without a token);
// POST/PUT/DELETE require an admin Bearer token via handleResource.
export default function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  return handleResource(req, res, {
    table: homeSlidesTable,
    defaultLimit: 20,
    required: ['imageUrl'],
    buildValues: (body) => ({
      imageUrl: body.imageUrl,
      altText: body.altText || '',
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
      // New slides default to visible; explicit true/'true' stays visible.
      active:
        body.active === undefined
          ? true
          : body.active === true || body.active === 'true',
    }),
  });
}