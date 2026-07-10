import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { checkRateLimit } from '../_lib/rateLimit.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  const rate = checkRateLimit(`${user.id}:review-post`, 30, 60 * 1000);
  if (!rate.allowed) {
    return res.status(429).json({
      error: 'Too many review saves. Try again shortly.',
      retryAfter: rate.retryAfterSec,
    });
  }

  if (rejectOversizedJsonBody(req, res, 256_000)) return;

  try {
    const body = readJsonBody(req);
    const { review, metadata } = body;

    if (!review || !String(review).trim()) {
      return res.status(400).json({ error: "Missing review content" });
    }

    const savedAt = new Date().toISOString();
    const title =
      metadata?.subject && metadata?.curriculum
        ? `${metadata.curriculum} ${metadata.subject} review`
        : 'Answer review';

    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('user_study_artifacts')
        .insert({
          user_id: user.id,
          kind: 'review',
          title,
          payload: { review: String(review), metadata: metadata ?? null },
          updated_at: savedAt,
        })
        .select('id')
        .single();

      if (error) throw error;

      return res.status(200).json({
        ok: true,
        savedAt,
        id: data?.id ?? null,
        metadata: metadata ?? null,
      });
    } catch (dbErr) {
      console.warn('review-post db fallback:', dbErr?.message || dbErr);
      return res.status(200).json({
        ok: true,
        savedAt,
        persisted: false,
        metadata: metadata ?? null,
      });
    }
  } catch (err) {
    console.error("review-post error:", err);
    return res.status(500).json({ error: "Failed to save review" });
  }
}
