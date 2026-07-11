import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { getQueryNumber, getQueryParam } from '../_lib/query.js';
import { checkRateLimit } from '../_lib/rateLimit.js';
import { isValidUuid } from '../_lib/security.js';

const ALLOWED_KINDS = new Set(['note', 'review', 'paper', 'planner', 'notebook']);
const MAX_PAYLOAD_BYTES = 256 * 1024;

export default async function handler(req, res) {
  const user = await verifyAuthUser(req, res);
  if (!user) return;

  const rate = await checkRateLimit(`${user.id}:user-content`, 120, 60 * 1000);
  if (!rate.allowed) {
    return res.status(429).json({
      error: 'Too many requests. Slow down and try again.',
      retryAfter: rate.retryAfterSec,
    });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error('user-content supabase config:', err);
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    if (req.method === 'GET') {
      const kind = getQueryParam(req, 'kind');
      const limit = getQueryNumber(req, 'limit', 20, 50);

      let query = supabase
        .from('user_study_artifacts')
        .select('id, kind, title, payload, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (kind && ALLOWED_KINDS.has(kind)) {
        query = query.eq('kind', kind);
      }

      const { data, error } = await query;
      if (error) {
        if (error.code === '42P01') {
          return res.status(503).json({
            error: 'Run supabase/migrations/20260709_user_study_artifacts.sql in Supabase first.',
          });
        }
        throw error;
      }

      return res.status(200).json({ items: data ?? [] });
    }

    if (req.method === 'POST') {
      if (rejectOversizedJsonBody(req, res, 512_000)) return;
      const body = readJsonBody(req);
      const kind = body?.kind;
      const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 200) : null;
      const payload = body?.payload ?? body?.content ?? body;

      if (!ALLOWED_KINDS.has(kind)) {
        return res.status(400).json({ error: 'Invalid kind. Use note, review, paper, planner, or notebook.' });
      }

      const payloadValue = typeof payload === 'object' ? payload : { text: String(payload) };
      const payloadSize = Buffer.byteLength(JSON.stringify(payloadValue), 'utf8');
      if (payloadSize > MAX_PAYLOAD_BYTES) {
        return res.status(413).json({ error: 'Artifact payload is too large.' });
      }

      if (kind === 'planner' && body?.replace === true) {
        const { error: deleteError } = await supabase
          .from('user_study_artifacts')
          .delete()
          .eq('user_id', user.id)
          .eq('kind', 'planner');
        if (deleteError) throw deleteError;
      }

      const { data, error } = await supabase
        .from('user_study_artifacts')
        .insert({
          user_id: user.id,
          kind,
          title,
          payload: payloadValue,
          updated_at: new Date().toISOString(),
        })
        .select('id, kind, title, created_at, updated_at')
        .single();

      if (error) {
        if (error.code === '42P01') {
          return res.status(503).json({
            error: 'Run supabase/migrations/20260709_user_study_artifacts.sql in Supabase first.',
          });
        }
        throw error;
      }
      return res.status(201).json({ ok: true, item: data });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      if (rejectOversizedJsonBody(req, res, 512_000)) return;
      const body = readJsonBody(req);
      const id = body?.id;
      if (!isValidUuid(id)) {
        return res.status(400).json({ error: 'Invalid artifact id' });
      }

      const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 200) : undefined;
      const payload = body?.payload ?? body?.content;
      const updates = { updated_at: new Date().toISOString() };

      if (title !== undefined) updates.title = title || null;
      if (payload !== undefined) {
        const payloadValue = typeof payload === 'object' ? payload : { text: String(payload) };
        const payloadSize = Buffer.byteLength(JSON.stringify(payloadValue), 'utf8');
        if (payloadSize > MAX_PAYLOAD_BYTES) {
          return res.status(413).json({ error: 'Artifact payload is too large.' });
        }
        updates.payload = payloadValue;
      }

      if (Object.keys(updates).length === 1) {
        return res.status(400).json({ error: 'Provide title and/or payload to update.' });
      }

      const { data, error } = await supabase
        .from('user_study_artifacts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id, kind, title, created_at, updated_at')
        .maybeSingle();

      if (error) {
        if (error.code === '42P01') {
          return res.status(503).json({
            error: 'Run supabase/migrations/20260709_user_study_artifacts.sql in Supabase first.',
          });
        }
        throw error;
      }
      if (!data) {
        return res.status(404).json({ error: 'Artifact not found' });
      }
      return res.status(200).json({ ok: true, item: data });
    }

    if (req.method === 'DELETE') {
      const body = readJsonBody(req);
      const id = body?.id;
      if (!isValidUuid(id)) {
        return res.status(400).json({ error: 'Invalid artifact id' });
      }

      const { error } = await supabase
        .from('user_study_artifacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('user-content error:', err);
    return res.status(500).json({ error: 'Failed to process study content' });
  }
}
