import { API_VERSION, dispatchRoute, resolveRouteKey } from './_lib/routes.js';
import { applyApiSecurityHeaders, enforceSameOriginCors, isProduction } from './_lib/security.js';
import { randomUUID } from 'crypto';

export const config = {
  maxDuration: 300,
  api: {
    bodyParser: false,
  },
};

function applyApiHeaders(res, requestId) {
  applyApiSecurityHeaders(res);
  res.setHeader('X-Vertex-API', API_VERSION);
  res.setHeader('X-Request-Id', requestId);
}

export default async function handler(req, res) {
  const requestId = req.headers['x-request-id'] || randomUUID();
  applyApiHeaders(res, requestId);

  if (!enforceSameOriginCors(req, res)) {
    return;
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
    return res.status(204).end();
  }

  const routeKey = resolveRouteKey(req);

  try {
    await dispatchRoute(routeKey, req, res);
    if (!res.writableEnded && !res.headersSent) {
      const payload = { error: 'Handler did not send a response', requestId };
      if (!isProduction()) payload.route = routeKey;
      res.status(500).json(payload);
    }
  } catch (error) {
    console.error(`[api/${routeKey}]`, requestId, error);
    if (!res.headersSent && !res.writableEnded) {
      const payload = { error: 'Internal server error', requestId };
      if (!isProduction()) payload.route = routeKey;
      res.status(500).json(payload);
    }
  }
}
