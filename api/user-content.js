import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from './_lib/auth.js';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';

const ALLOWED_KINDS = new Set(['note', 'review', 'paper']);

export default async function handler(req, res) {
  const user = await verifyAuthUser(req, res);
  if (!user) return;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error('user-content supabase config:', err);
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://localhost');
      const kind = url.searchParams.get('kind');
      const limit = Math.min(Number(url.searchParams.get('limit') || 20), 50);

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
        return res.status(400).json({ error: 'Invalid kind. Use note, review, or paper.' });
      }

      const { data, error } = await supabase
        .from('user_study_artifacts')
        .insert({
          user_id: user.id,
          kind,
          title,
          payload: typeof payload === 'object' ? payload : { text: String(payload) },
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

    if (req.method === 'DELETE') {
      const body = readJsonBody(req);
      const id = body?.id;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing artifact id' });
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
