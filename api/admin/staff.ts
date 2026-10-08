import type { VercelRequest, VercelResponse } from '@vercel/node';
import { staff as staffTable } from '../../lib/db';
import { handleResource } from '../../lib/resource';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  return handleResource(req, res, {
    table: staffTable,
    defaultLimit: 50,
    required: ['name', 'position', 'email', 'bio', 'image'],
    buildValues: (body) => ({
      name: body.name,
      position: body.position,
      department: body.department || 'Built Environment',
      email: body.email,
      phone: body.phone || '',
      address: body.address || '',
      bio: body.bio,
      welcomeMessage: body.welcomeMessage ?? null,
      image: body.image,
      researchInterests: body.researchInterests || '[]',
    }),
  });
}
