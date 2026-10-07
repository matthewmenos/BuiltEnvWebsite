import { env } from '../../env';

export async function handleRequest(req: any, res: any): Promise<void> {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.writeHead(200).end(
      JSON.stringify({
        status: 'ok',
        environment: env.nodeEnv,
        uptime: process.uptime(),
      })
    );
  } else {
    res.writeHead(405).end(JSON.stringify({ error: 'Method not allowed' }));
  }
}
