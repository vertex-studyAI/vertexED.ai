export function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user) {
  if (!user?.email) return false;
  const allowed = getAdminEmails();
  if (!allowed.length) return false;
  return allowed.includes(String(user.email).toLowerCase());
}

export function requireAdmin(user, res) {
  if (!isAdminUser(user)) {
    res.status(403).json({ error: 'Admin access required.' });
    return false;
  }
  return true;
}
