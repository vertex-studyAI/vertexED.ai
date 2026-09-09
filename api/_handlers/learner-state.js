import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { getQueryParam } from '../_lib/query.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import {
  listLearnerStateItems,
  normalizeLearnerStateItem,
  syncLearnerStateItems,
} from '../_lib/learnerStateStore.js';

const MAX_BATCH_ITEMS = 50;

function migrationUnavailable(error) {
  return ['42P01', '42883', 'PGRST202', 'PGRST205'].includes(error?.code);
}

export default async function handler(req, res) {
  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!(await rateLimitUserEndpoint(user.id, 'learner-state', res))) return;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (error) {
    console.error('learner-state supabase config:', error instanceof Error ? error.name : 'UnknownError');
    return res.status(503).json({ error: 'Learner-state storage is not configured.' });
  }

  try {
    if (req.method === 'GET') {
      let page;
      try { page = await listLearnerStateItems(supabase, user.id, getQueryParam(req, 'cursor')); }
      catch (error) { if (error instanceof TypeError) return res.status(400).json({ error: error.message }); throw error; }
      const { data, error, nextCursor } = page;
      if (error) {
        if (migrationUnavailable(error)) return res.status(503).json({ error: 'Learner-state migration is not applied.' });
        throw error;
      }
      return res.status(200).json({
        contractVersion: 'vertexed.learner-state.v1',
        nextCursor,
        items: (data ?? []).map((item) => ({
          stateType: item.state_type,
          stateKey: item.state_key,
          payload: item.payload,
          clientRevision: item.client_revision,
          clientUpdatedAt: item.client_updated_at,
          serverUpdatedAt: item.updated_at,
        })),
      });
    }

    if (req.method === 'POST') {
      if (rejectOversizedJsonBody(req, res, 1024 * 1024)) return;
      const body = readJsonBody(req);
      const requested = Array.isArray(body?.items) ? body.items : [];
      if (!requested.length || requested.length > MAX_BATCH_ITEMS) {
        return res.status(400).json({ error: `Provide between 1 and ${MAX_BATCH_ITEMS} learner-state items.` });
      }
      const items = requested.map(normalizeLearnerStateItem);
      if (items.some((item) => !item)) return res.status(400).json({ error: 'Invalid learner-state item.' });

      const keys = new Set(items.map((item) => `${item.stateType}:${item.stateKey}`));
      if (keys.size !== items.length) return res.status(400).json({ error: 'Duplicate learner-state key in batch.' });
      const { data, error } = await syncLearnerStateItems(supabase, user.id, items);
      if (error) {
        if (migrationUnavailable(error)) return res.status(503).json({ error: 'Learner-state migration is not applied.' });
        throw error;
      }
      const results = (data ?? []).map((item) => ({
        stateType: item.state_type,
        stateKey: item.state_key,
        requestedRevision: item.requested_revision,
        currentRevision: item.current_revision ?? null,
        applied: item.applied === true,
        serverUpdatedAt: item.server_updated_at ?? null,
      }));
      return res.status(200).json({ contractVersion: 'vertexed.learner-state.v1', results });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('learner-state error:', error?.code || (error instanceof Error ? error.name : 'UnknownError'));
    return res.status(500).json({ error: 'Failed to process learner state.' });
  }
}
