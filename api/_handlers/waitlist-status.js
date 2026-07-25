import { verifyAuthUser } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { normalizeEmail } from '../_lib/security.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  try {
    const supabase = getSupabaseAdmin();
    let { data: entry, error } = await supabase
      .from('waitlist')
      .select('status, signup_method')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (!entry && user.email) {
      const email = normalizeEmail(user.email);
      ({ data: entry, error } = await supabase
        .from('waitlist')
        .select('status, signup_method')
        .eq('email', email)
        .maybeSingle());
      if (error) throw error;
    }

    // Existing accounts predating waitlist gating remain usable.
    const status = entry?.status ?? 'approved';
    return res.status(200).json({ status, method: entry?.signup_method ?? null, access: status === 'approved' });
  } catch (err) {
    console.error('waitlist-status error:', err);
    return res.status(500).json({ error: 'Could not verify account access.' });
  }
}