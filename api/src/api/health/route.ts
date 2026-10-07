import { env } from '../env';

export async function handleRequest(req: any, res: any): Promise<void> {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      status: 'ok',
      environment: env.nodeEnv,
    })
  );
}
