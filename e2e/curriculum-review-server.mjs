// Local acceptance only. Synthetic identities and an explicitly supplied private
// store exercise the actual handlers without contacting a hosted auth/database.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

if (!process.env.VERTEXED_CURRICULUM_REVIEW_STORE) {
  throw new Error('Set VERTEXED_CURRICULUM_REVIEW_STORE to the retained private store before running this acceptance server.');
}
const port = 14674;
const origin = `http://127.0.0.1:${port}`;
const root = fileURLToPath(new URL('../.vertexed-test-dist/', import.meta.url));
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = origin;
process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_local_curriculum_acceptance';
process.env.ADMIN_EMAILS = 'reviewer@example.test';
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.SUPABASE_SECRET_KEY;

const user = (email, id) => ({
  id, email, aud: 'authenticated', role: 'authenticated',
  email_confirmed_at: '2026-01-01T00:00:00.000Z',
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { username: 'localreviewer', full_name: 'Local acceptance identity', board: 'IB_DP', grade: 11, subjects: ['Physics'], onboardingCompleted: true },
  identities: [], is_anonymous: false,
});
const users = [user('reviewer@example.test', 'c7318f55-32d7-436c-a51a-f57c3545e8ca'), user('learner@example.test', '3e58f35d-4e25-46ee-9daa-8cd061a73d9e')];
const token = (item) => [
  Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
  Buffer.from(JSON.stringify({ sub: item.id, email: item.email, role: 'authenticated', aud: 'authenticated', exp: 2103836400 })).toString('base64url'),
  'local-curriculum-fixture-only',
].join('.');
const identities = new Map(users.map((item) => [`Bearer ${token(item)}`, item]));
const { default: review } = await import('../api/_handlers/curriculum-review.js');
const { default: admin } = await import('../api/_handlers/admin-status.js');
const mime = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };

const server = createServer(async (req, res) => {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); return res; };
  res.send = (body) => { res.end(body); return res; };
  try {
    const url = new URL(req.url, origin);
    req.query = Object.fromEntries(url.searchParams);
    const identity = identities.get(req.headers.authorization);
    if (url.pathname === '/auth/v1/token') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      const item = users.find((candidate) => candidate.email === body.email);
      if (!item || body.password !== 'LocalAcceptanceOnly2026!') return res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid local fixture credentials.' });
      return res.json({ access_token: token(item), token_type: 'bearer', expires_in: 315360000, expires_at: 2103836400, refresh_token: 'local-only-refresh', user: item });
    }
    if (url.pathname === '/auth/v1/user') return identity ? res.json(identity) : res.status(401).json({ message: 'Invalid local token', code: 'bad_jwt' });
    if (url.pathname === '/auth/v1/logout') return res.status(204).end();
    if (url.pathname === '/rest/v1/profiles') {
      if (!identity) return res.status(401).json({ error: 'Local fixture authentication required.' });
      return res.json({ id: identity.id, email: identity.email, full_name: 'Local acceptance identity', board: 'IB_DP', grade: 11, subjects: ['Physics'], created_at: identity.created_at, updated_at: identity.updated_at });
    }
    if (url.pathname === '/api/curriculum-review') return await review(req, res);
    if (url.pathname === '/api/admin-status') return await admin(req, res);
    if (url.pathname === '/api/waitlist-status') return identity ? res.json({ status: 'approved' }) : res.status(401).json({ error: 'Local fixture authentication required.' });
    if (url.pathname === '/api/user-content') return res.json({ items: [] });
    if (url.pathname === '/api/learner-state') return res.json({ contractVersion: 'vertexed.learner-state.v1', items: [] });
    if (url.pathname === '/api/telemetry') return res.json({ ok: true });
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/') || url.pathname.startsWith('/rest/')) return res.status(404).json({ error: 'Endpoint outside this acceptance harness.' });
    if (url.pathname.startsWith('/_vercel/')) { res.setHeader('Content-Type', 'text/javascript'); return res.end(''); }
    const file = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    const rel = relative(root, file);
    if (rel.startsWith('..') || isAbsolute(rel)) return res.status(403).end();
    const info = await stat(file).catch(() => null);
    const selected = info?.isFile() ? file : (extname(url.pathname) ? null : resolve(root, 'index.html'));
    if (!selected) return res.status(404).end();
    res.setHeader('Content-Type', mime[extname(selected)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.end(req.method === 'HEAD' ? undefined : await readFile(selected));
  } catch (error) {
    console.error('Local acceptance request failed:', error.message);
    if (!res.headersSent) res.status(500).json({ error: 'Local acceptance server error.' });
    else res.end();
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Curriculum acceptance server: ${origin}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
