import { createClient } from '@supabase/supabase-js';
import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { requireAdmin } from '../_lib/admin.js';
import { sendWaitlistApprovedEmail } from '../_lib/notify.js';
import { isValidUuid } from '../_lib/security.js';
import { buildInviteSignupUrl, generateInviteToken } from '../_lib/inviteToken.js';

const VALID_STATUSES = new Set(['pending', 'approved', 'rejected']);

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!requireAdmin(user, res)) return;

  if (rejectOversizedJsonBody(req, res)) return;

  let supabase;
  try {
    supabase = getSupabase();
  } catch (err) {
    console.error('Waitlist admin config error:', err);
    return res.status(500).json({ error: 'Waitlist admin is not configured on the server.' });
  }

  try {
    const body = readJsonBody(req);
    const action = body.action;

    if (action === 'list') {
      const status = body.status;
      let query = supabase
        .from('waitlist')
        .select('id, email, status, invite_token, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(200);

      if (status && VALID_STATUSES.has(status)) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ entries: data ?? [] });
    }

    if (action === 'update') {
      const { id, status } = body;
      if (!isValidUuid(id) || !status || !VALID_STATUSES.has(status)) {
        return res.status(400).json({ error: 'Invalid id or status.' });
      }

      const updates = { status, updated_at: new Date().toISOString() };
      if (status === 'approved') {
        updates.invite_token = generateInviteToken();
      }
      if (status === 'pending' || status === 'rejected') {
        updates.invite_token = null;
      }

      const { data, error } = await supabase
        .from('waitlist')
        .update(updates)
        .eq('id', id)
        .select('id, email, status, invite_token, created_at, updated_at')
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Waitlist entry not found.' });
      }

      const origin = req.headers.origin || req.headers.referer?.replace(/\/[^/]*$/, '') || process.env.SITE_URL;
      const inviteLink = data.invite_token
        ? buildInviteSignupUrl(origin, data.invite_token)
        : null;

      let emailSent = false;
      if (status === 'approved' && data.email) {
        const notify = await sendWaitlistApprovedEmail(data.email, inviteLink);
        emailSent = Boolean(notify.sent);
      }

      return res.status(200).json({ entry: data, inviteLink, emailSent });
    }

    return res.status(400).json({ error: 'Unknown action. Use "list" or "update".' });
  } catch (err) {
    console.error('Waitlist admin error:', err);
    return res.status(500).json({ error: 'Could not process waitlist admin request.' });
  }
}
