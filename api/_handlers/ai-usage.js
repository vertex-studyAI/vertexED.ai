import { verifyAuthUser } from '../_lib/auth.js';
import { readAiUsage, sendAiUsageError } from '../_lib/aiUsage.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = await verifyAuthUser(req, res);
  if (!user) return;
  try { return res.status(200).json(await readAiUsage(user.id)); }
  catch (error) { return sendAiUsageError(res, error); }
}
