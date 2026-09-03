import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { getQueryNumber, getQueryParam } from '../_lib/query.js';
import { checkRateLimit } from '../_lib/rateLimit.js';
import { isValidUuid } from '../_lib/security.js';
import { createStudyArtifact, replaceSingletonArtifact } from '../_lib/userContentStore.js';
import {
  STUDY_ARTIFACT_KINDS,
  normalizeStudyArtifactPayload,
  parseStudyArtifactCreate,
} from '../../contracts/studyArtifact.js';

const ALLOWED_KINDS = new Set(STUDY_ARTIFACT_KINDS);
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
      const parsed = parseStudyArtifactCreate(body);
      if (!parsed.ok) return res.status(400).json({ error: parsed.error });
      const { kind, title, payload: payloadValue, idempotencyKey } = parsed.value;
      const payloadSize = Buffer.byteLength(JSON.stringify(payloadValue), 'utf8');
      if (payloadSize > MAX_PAYLOAD_BYTES) {
        return res.status(413).json({ error: 'Artifact payload is too large.' });
      }

      const updatedAt = new Date().toISOString();
      const writeResult = (kind === 'planner' || kind === 'notebook') && body?.replace === true
        ? await replaceSingletonArtifact(supabase, {
            userId: user.id,
            kind,
            title,
            payload: payloadValue,
            updatedAt,
          })
        : await createStudyArtifact(supabase, {
            userId: user.id,
            kind,
            title,
            payload: payloadValue,
            idempotencyKey,
            updatedAt,
          });

      const { data, error, replayed = false, conflict = false } = writeResult;
      if (conflict) {
        return res.status(409).json({
          error: 'Idempotency key was already used for different artifact content.',
        });
      }
      if (error) {
        if (error.code === '42P01') {
          return res.status(503).json({
            error: 'Run supabase/migrations/20260709_user_study_artifacts.sql in Supabase first.',
          });
        }
        throw error;
      }
      const item = data ? {
        id: data.id,
        kind: data.kind,
        title: data.title,
        created_at: data.created_at,
        updated_at: data.updated_at,
      } : null;
      return res.status(replayed ? 200 : 201).json({ ok: true, item, replayed });
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
        const parsedPayload = normalizeStudyArtifactPayload(payload);
        if (!parsedPayload.ok) return res.status(400).json({ error: parsedPayload.error });
        const payloadValue = parsedPayload.value;
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
