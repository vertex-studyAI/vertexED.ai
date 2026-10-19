import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { appendRevisionEvent, listRevisionEvents } from '../_lib/revisionHistoryStore.js';
import { getQueryParam } from '../_lib/query.js';

function unavailable(error) {
  return ['42P01', 'PGRST205'].includes(error?.code);
}

export default async function handler(req, res) {
  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!(await rateLimitUserEndpoint(user.id, 'revision-history', res, { limit: 120, windowMs: 60 * 60 * 1000 }))) return;

  let supabase;
  try { supabase = getSupabaseAdmin(); }
  catch { return res.status(503).json({ error: 'Revision history storage is not configured.' }); }

  if (req.method === 'GET') {
    let result;
    try { result = await listRevisionEvents(supabase, user.id, getQueryParam(req, 'cursor')); }
    catch (error) {
      if (error instanceof TypeError) return res.status(400).json({ error: 'Invalid revision-history cursor.' });
      return res.status(500).json({ error: 'Revision history is temporarily unavailable.' });
    }
    if (unavailable(result.error)) return res.status(503).json({ error: 'Revision history migration is not applied.' });
    if (result.error) return res.status(500).json({ error: 'Revision history is temporarily unavailable.' });
    return res.status(200).json({ contractVersion: 'vertexed.revision-history.v1', events: result.data, nextCursor: result.nextCursor });
  }

  if (req.method === 'POST') {
    if (rejectOversizedJsonBody(req, res, 16 * 1024)) return;
    let result;
    try { result = await appendRevisionEvent(supabase, user.id, readJsonBody(req)); }
    catch { return res.status(500).json({ error: 'Revision event could not be saved.' }); }
    if (result.error?.code === 'INVALID_REVISION_EVENT') return res.status(400).json({ error: 'Invalid revision event.' });
    if (result.error?.code === 'REVISION_PARENT_NOT_FOUND') return res.status(409).json({ error: 'A linked revision event was not found for this account.' });
    if (result.error?.code === 'REVISION_EVENT_CONFLICT') return res.status(409).json({ error: 'Revision event identity conflicts with an existing record.' });
    if (unavailable(result.error)) return res.status(503).json({ error: 'Revision history migration is not applied.' });
    if (result.error) return res.status(500).json({ error: 'Revision event could not be saved.' });
    return res.status(result.idempotent ? 200 : 201).json({ contractVersion: 'vertexed.revision-history.v1', event: result.data, idempotent: result.idempotent });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed.' });
}
