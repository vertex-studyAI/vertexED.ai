import { API_VERSION, ROUTES } from '../_lib/routes.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  return res.status(200).json({
    ok: true,
    service: 'vertexed',
    apiVersion: API_VERSION,
    routes: Object.keys(ROUTES).length,
    timestamp: new Date().toISOString(),
  });
}
