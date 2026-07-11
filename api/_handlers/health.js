import { API_VERSION, ROUTES } from '../_lib/routes.js';
import { isProduction } from '../_lib/security.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  const payload = {
    ok: true,
    service: 'vertexed',
    apiVersion: API_VERSION,
    timestamp: new Date().toISOString(),
  };

  if (!isProduction()) {
    payload.routes = Object.keys(ROUTES).length;
  }

  return res.status(200).json(payload);
}
