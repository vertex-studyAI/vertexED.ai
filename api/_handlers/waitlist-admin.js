import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { requireAdmin } from '../_lib/admin.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { sendWaitlistApprovedEmail } from '../_lib/notify.js';
import { isValidUuid } from '../_lib/security.js';
import { buildInviteSignupUrl, generateInviteToken } from '../_lib/inviteToken.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';

const VALID_STATUSES = new Set(['pending', 'approved', 'rejected']);

function isValidWaitlistId(id) {
  return isValidUuid(id) || (typeof id === 'number' && Number.isSafeInteger(id) && id > 0) || (/^\d+$/.test(String(id)) && Number(String(id)) > 0);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!requireAdmin(user, res)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'waitlist-admin', res, { limit: 300, windowMs: 60 * 60 * 1000 }))) return;

  if (rejectOversizedJsonBody(req, res)) return;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error('Waitlist admin config error:', err instanceof Error ? err.name : 'UnknownError');
    return res.status(503).json({ error: 'Waitlist admin is not configured on the server.' });
  }

  try {
    const body = readJsonBody(req);
    const action = body.action;

    if (action === 'list') {
      const status = body.status;
      const search = typeof body.search === 'string' ? body.search.trim().slice(0, 160) : '';
      const page = Math.max(1, Math.min(Number.parseInt(body.page, 10) || 1, 10_000));
      const pageSize = [25, 50, 100].includes(Number(body.pageSize)) ? Number(body.pageSize) : 50;
      const from = (page - 1) * pageSize;
      let query = supabase
        .from('waitlist')
        .select('id, email, status, signup_method, created_at, updated_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);

      if (status && VALID_STATUSES.has(status)) {
        query = query.eq('status', status);
      }
      if (search) {
        query = query.ilike('email', `%${search.replace(/[%,_]/g, '\\$&')}%`);
      }

      const [entriesResult, allResult, pendingResult, approvedResult, rejectedResult] = await Promise.all([
        query,
        supabase.from('waitlist').select('*', { count: 'exact', head: true }),
        supabase.from('waitlist').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('waitlist').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('waitlist').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      ]);
      const { data, error, count } = entriesResult;
      if (error) throw error;
      for (const result of [allResult, pendingResult, approvedResult, rejectedResult]) {
        if (result.error) throw result.error;
      }

      const databaseUrl = new URL(process.env.SUPABASE_URL).origin;
      return res.status(200).json({
        entries: data ?? [],
        pagination: {
          page,
          pageSize,
          total: count ?? 0,
          totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
        },
        counts: {
          all: allResult.count ?? 0,
          pending: pendingResult.count ?? 0,
          approved: approvedResult.count ?? 0,
          rejected: rejectedResult.count ?? 0,
        },
        database: { url: databaseUrl, schema: 'public', table: 'waitlist' },
      });
    }

    if (action === 'update') {
      const { id, status } = body;
      if (!isValidWaitlistId(id) || !status || !VALID_STATUSES.has(status)) {
        return res.status(400).json({ error: 'Invalid id or status.' });
      }

      const { data: existing, error: existingError } = await supabase.from('waitlist').select('signup_method').eq('id', id).maybeSingle();
      if (existingError) throw existingError;
      if (!existing) return res.status(404).json({ error: 'Waitlist entry not found.' });

      const updates = { status, updated_at: new Date().toISOString() };
      if (status === 'approved' && existing.signup_method !== 'google') {
        updates.invite_token = generateInviteToken();
      }
      if (status === 'pending' || status === 'rejected') {
        updates.invite_token = null;
      }

      const { data, error } = await supabase
        .from('waitlist')
        .update(updates)
        .eq('id', id)
        .select('id, email, status, signup_method, invite_token, created_at, updated_at')
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Waitlist entry not found.' });
      }

      const origin = process.env.APP_URL || process.env.SITE_URL || 'https://www.vertexed.app';
      const inviteLink = data.invite_token
        ? buildInviteSignupUrl(origin, data.invite_token)
        : null;

      let emailSent = false;
      if (status === 'approved' && data.email) {
        const notify = await sendWaitlistApprovedEmail(data.email, inviteLink, data.signup_method);
        emailSent = Boolean(notify.sent);
      }

      const { invite_token: _inviteToken, ...safeEntry } = data;
      return res.status(200).json({ entry: safeEntry, inviteLink, emailSent });
    }

    return res.status(400).json({ error: 'Unknown action. Use "list" or "update".' });
  } catch (err) {
    console.error('Waitlist admin error:', err instanceof Error ? err.name : 'UnknownError');
    return res.status(500).json({ error: 'Could not process waitlist admin request.' });
  }
}
