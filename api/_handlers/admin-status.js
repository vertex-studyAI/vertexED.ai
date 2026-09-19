import { verifyAuthUser } from '../_lib/auth.js';
import { isAdminUser } from '../_lib/admin.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  if (!(await rateLimitUserEndpoint(user.id, 'admin-status', res, { limit: 120, windowMs: 60 * 60 * 1000 }))) {
    return;
  }

  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  return res.status(200).json({ admin: isAdminUser(user) });
}
