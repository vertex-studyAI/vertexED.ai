import type { ExamBoard } from '@/types/curriculum';

export type Profile = {
  id: string; // uuid, matches auth.users.id
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  board?: ExamBoard | null;
  grade?: number | null;
  subjects?: string[] | null;
  exam_date?: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
};
