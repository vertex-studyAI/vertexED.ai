import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { error } = await supabase.auth.signOut();

  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json({ message: 'Logged out successfully' });
}
