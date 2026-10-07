import http from 'http';
import { env } from './env';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`[API] ${req.method} ${req.url}`);

  // Route requests to the appropriate handler
  if (req.url?.startsWith('/api/admin/login')) {
    import('./api/admin/login/route.js').then((mod) => {
      mod.handleRequest(req, res);
    });
  } else if (req.url?.startsWith('/api/admin/logout')) {
    import('./api/admin/logout/route.js').then((mod) => {
      mod.handleRequest(req, res);
    });
  } else if (req.url?.startsWith('/api/admin/health')) {
    import('./api/admin/health/route.js').then((mod) => {
      mod.handleRequest(req, res);
    });
  } else if (req.url?.startsWith('/api/admin/programmes')) {
    import('./api/admin/programmes/route.js').then((mod) => {
      mod.handleRequest(req, res);
    });
  } else if (req.url?.startsWith('/api/admin/news')) {
    import('./api/admin/news/route.js').then((mod) => {
      mod.handleRequest(req, res);
    });
  } else if (req.url?.startsWith('/api/admin/events')) {
    import('./api/admin/events/route.js').then((mod) => {
      mod.handleRequest(req, res);
    });
  } else if (req.url?.startsWith('/api/admin/staff')) {
    import('./api/admin/staff/route.js').then((mod) => {
      mod.handleRequest(req, res);
    });
  } else if (req.url?.startsWith('/api/admin/gallery')) {
    import('./api/admin/gallery/route.js').then((mod) => {
      mod.handleRequest(req, res);
    });
  } else if (req.url?.startsWith('/api/admin/notices')) {
    import('./api/admin/notices/route.js').then((mod) => {
      mod.handleRequest(req, res);
    });
  } else if (req.url?.startsWith('/api/admin/contacts')) {
    import('./api/admin/contacts/route.js').then((mod) => {
      mod.handleRequest(req, res);
    });
  } else if (req.url?.startsWith('/api/admin/files')) {
    import('./api/admin/files/route.js').then((mod) => {
      mod.handleRequest(req, res);
    });
  } else if (req.url?.startsWith('/api/health')) {
    import('./api/health/route.js').then((mod) => {
      mod.handleRequest(req, res);
    });
  } else {
    res.writeHead(404).end('Not found');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[API] SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});

server.listen(PORT, () => {
  console.log(`[API] Server listening on port ${PORT}`);
  console.log(`[API] Environment: ${env.nodeEnv}`);
});
