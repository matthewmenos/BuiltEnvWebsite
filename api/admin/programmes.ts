import type { VercelRequest, VercelResponse } from '@vercel/node';
import { programmes as programmesTable } from '../../lib/db';
import { handleResource } from '../../lib/resource';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  return handleResource(req, res, {
    table: programmesTable,
    defaultLimit: 50,
    required: ['title', 'shortCode', 'description', 'faculty', 'duration'],
    buildValues: (body) => ({
      title: body.title,
      shortCode: body.shortCode,
      description: body.description,
      faculty: body.faculty,
      duration: body.duration,
      admission: body.admission,
      euFees: body.euFees,
      nonEuFees: body.nonEuFees,
      accreditation: body.accreditation,
      images: body.images || '[]',
    }),
  });
}
