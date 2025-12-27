import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role Key to bypass RLS and access admin features
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // 1. Verify the user's token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ allowed: false, error: 'Invalid token' });
    }

    const email = user.email;

    // 2. Check if the user is in the waitlist with a valid status
    // We assume 'invited' or 'accepted' means they can access.
    // Also, if they are not in waitlist, we deny access.
    const { data: waitlistEntry, error: dbError } = await supabase
      .from('waitlist')
      .select('status')
      .eq('email', email)
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
      console.error('Database error:', dbError);
      // If DB error, fail safe? Or allow? 
      // Let's fail safe for now, but maybe log it.
      return res.status(500).json({ allowed: false, error: 'Database error' });
    }

    // If not in waitlist, deny.
    if (!waitlistEntry) {
       // OPTIONAL: Check if they are an admin or have some other flag in profiles?
       // For now, strict waitlist check.
       return res.status(200).json({ allowed: false, reason: 'not_in_waitlist' });
    }

    const status = waitlistEntry.status;
    // Allowed statuses: 'invited', 'accepted'. 
    // 'pending' is NOT allowed.
    if (status === 'invited' || status === 'accepted') {
      return res.status(200).json({ allowed: true });
    } else {
      return res.status(200).json({ allowed: false, reason: 'waitlist_pending' });
    }

  } catch (err) {
    console.error('Check Access API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
