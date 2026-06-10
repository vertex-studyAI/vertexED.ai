export type Profile = {
  id: string; // uuid, matches auth.users.id
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
};
