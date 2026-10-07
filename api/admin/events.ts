import type { VercelRequest, VercelResponse } from '@vercel/node';
import { events as eventsTable } from '../../lib/db';
import { handleResource } from '../../lib/resource';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  return handleResource(req, res, {
    table: eventsTable,
    defaultLimit: 20,
    required: ['title', 'description', 'location', 'startTime', 'endTime'],
    buildValues: (body) => ({
      title: body.title,
      description: body.description,
      location: body.location,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      image: body.image || '',
      category: body.category || 'general',
    }),
  });
}
