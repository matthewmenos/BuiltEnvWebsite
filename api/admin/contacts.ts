import type { VercelRequest, VercelResponse } from '@vercel/node';
import { contacts as contactsTable } from '../../lib/db';
import { clientIp, handleResource } from '../../lib/resource';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Public endpoint — no auth required for the contact form.
  return handleResource(req, res, {
    table: contactsTable,
    defaultLimit: 50,
    required: ['name', 'email', 'subject', 'message'],
    publicWrite: true,
    buildValues: (body, req) => ({
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
      ipAddress: clientIp(req),
      userAgent: req.headers['user-agent'] || '',
    }),
  });
}
