import { API_VERSION, dispatchRoute, resolveRouteKey } from './_lib/routes.js';

export const config = {
  maxDuration: 60,
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

  const routeKey = resolveRouteKey(req);

  try {
    await dispatchRoute(routeKey, req, res);
  } catch (error) {
    console.error(`[api/${routeKey}]`, error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        route: routeKey,
      });
    }
  }
}
