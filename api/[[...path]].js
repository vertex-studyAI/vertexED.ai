import { API_VERSION, dispatchRoute, resolveRouteKey } from './_lib/routes.js';

export const config = {
  maxDuration: 300,
  api: {
    bodyParser: false,
  },
};

function applyApiHeaders(res) {
  res.setHeader('X-Vertex-API', API_VERSION);
  res.setHeader('Cache-Control', 'no-store');
}

export default async function handler(req, res) {
  applyApiHeaders(res);

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
    return res.status(204).end();
  }

  const routeKey = resolveRouteKey(req);

  try {
    await dispatchRoute(routeKey, req, res);
    if (!res.writableEnded && !res.headersSent) {
      res.status(500).json({ error: 'Handler did not send a response', route: routeKey });
    }
  } catch (error) {
    console.error(`[api/${routeKey}]`, error);
    if (!res.headersSent && !res.writableEnded) {
      res.status(500).json({
        error: 'Internal server error',
        route: routeKey,
      });
    }
  }
}
