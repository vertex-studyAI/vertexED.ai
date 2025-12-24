
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role Key to bypass RLS and access admin features
// Ensure process.env.SUPABASE_SERVICE_ROLE_KEY is set in your .env file
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // 1. Check if the user is already a registered Supabase Auth user
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) throw userError;

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already has an active account. Please log in.' });
    }

    // 2. Add to the 'waitlist' table
    const { error: dbError } = await supabase
      .from('waitlist')
      .insert([{ email, status: 'pending' }]);

    if (dbError) {
      // Check for unique violation (Postgres code 23505)
      if (dbError.code === '23505') {
        return res.status(409).json({ error: 'Email is already on the waitlist.' });
      }
      throw dbError;
    }

    return res.status(200).json({ message: 'You have been added to the waitlist. We will notify you when you are accepted.' });
  } catch (err) {
    console.error('Waitlist API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
