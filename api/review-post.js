import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from './lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  if (rejectOversizedJsonBody(req, res)) return;

  try {
    const body = readJsonBody(req);
    const { review, metadata } = body;

    if (!review || !String(review).trim()) {
      return res.status(400).json({ error: "Missing review content" });
    }

    // Acknowledge save — persistence can be added later (Supabase, etc.)
    return res.status(200).json({
      ok: true,
      savedAt: new Date().toISOString(),
      metadata: metadata ?? null,
    });
  } catch (err) {
    console.error("review-post error:", err);
    return res.status(500).json({ error: "Failed to save review" });
  }
}
