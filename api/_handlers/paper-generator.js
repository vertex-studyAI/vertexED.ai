import { verifyAuthUser } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  return res.status(410).json({
    success: false,
    code: 'ORIGINAL_GENERATOR_RETIRED',
    error:
      'The legacy paper generator has been retired. Use the verified exam catalogue flow instead so only administrator-approved assessment content can be served.',
  });
}
