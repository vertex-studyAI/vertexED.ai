/** Client-side admin check — mirror `ADMIN_EMAILS` in `VITE_ADMIN_EMAILS`. */
export function getAdminEmails(): string[] {
  const raw = import.meta.env.VITE_ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: { email?: string | null } | null | undefined): boolean {
  if (!user?.email) return false;
  const allowed = getAdminEmails();
  if (!allowed.length) return false;
  return allowed.includes(String(user.email).toLowerCase());
}
