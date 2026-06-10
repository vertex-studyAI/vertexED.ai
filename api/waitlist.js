import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role Key to bypass RLS and access admin features.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (!supabase) {
    return res.status(503).json({
      error: 'Waitlist service is not configured yet. Please try again later.'
    });
  }

  try {
    const { error: dbError } = await supabase
      .from('waitlist')
      .upsert([{ email, status: 'pending' }], { onConflict: 'email' });

    if (dbError) {
      throw dbError;
    }

    return res.status(200).json({ message: 'You have been added to the waitlist. We will notify you when you are accepted.' });
  } catch (err) {
    console.error('Waitlist API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
