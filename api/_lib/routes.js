/**
 * Central API route registry — keeps Vercel Hobby deployments to a single Serverless Function.
 * Individual handlers live in api/_handlers/ (underscore-prefixed paths are not deployed as functions).
 */

import { MAX_JSON_BODY_BYTES, verifyAuthUser } from './auth.js';
import { requireVertexAccess } from './vertexAccess.js';
import { requireAdmin } from './admin.js';
import { runAiUsageRequest } from './aiUsage.js';

export const API_VERSION = '1';

/** @type {Record<string, { access: 'public' | 'account' | 'member' | 'admin', loader: () => Promise<{ default: Function }>, methods?: string[], rawBody?: boolean, maxBodyBytes?: number }>} */
export const ROUTES = {
  health: {
    access: 'public',
    loader: () => import('../_handlers/health.js'),
    methods: ['GET', 'HEAD'],
  },
  telemetry: {
    access: 'public',
    loader: () => import('../_handlers/telemetry.js'),
    methods: ['POST'],
    maxBodyBytes: 8 * 1024,
  },
  'admin-status': {
    access: 'account',
    loader: () => import('../_handlers/admin-status.js'),
    methods: ['GET', 'HEAD'],
  },
  account: {
    access: 'account',
    loader: () => import('../_handlers/account.js'),
    methods: ['DELETE'],
  },
  'account-export': {
    access: 'account',
    loader: () => import('../_handlers/account-export.js'),
    methods: ['GET'],
  },
  'ai-usage': {
    access: 'account',
    loader: () => import('../_handlers/ai-usage.js'),
    methods: ['GET'],
  },
  waitlist: {
    access: 'public',
    loader: () => import('../_handlers/waitlist.js'),
    methods: ['POST'],
  },
  'waitlist-status': {
    access: 'account',
    loader: () => import('../_handlers/waitlist-status.js'),
    methods: ['GET'],
  },
  'signup-invite': {
    access: 'public',
    loader: () => import('../_handlers/signup-invite.js'),
    methods: ['POST'],
  },
  'waitlist-admin': {
    access: 'admin',
    loader: () => import('../_handlers/waitlist-admin.js'),
    methods: ['POST'],
  },
  'study-guide-chat': {
    access: 'member',
    loader: () => import('../_handlers/study-guide-chat.js'),
    methods: ['POST'],
  },
  ask: {
    access: 'member',
    loader: () => import('../_handlers/ask.js'),
    methods: ['POST'],
  },
  agents: {
    access: 'member',
    loader: () => import('../_handlers/agents.js'),
    methods: ['GET'],
  },
  quiz: {
    access: 'member',
    loader: () => import('../_handlers/quiz.js'),
    methods: ['POST'],
  },
  note: {
    access: 'member',
    loader: () => import('../_handlers/note.js'),
    methods: ['POST'],
  },
  planner: {
    access: 'member',
    loader: () => import('../_handlers/planner.js'),
    methods: ['POST'],
  },
  'paper-generator': {
    access: 'member',
    loader: () => import('../_handlers/paper-generator.js'),
    methods: ['POST'],
  },
  review: {
    access: 'member',
    loader: () => import('../_handlers/review-safe.ts'),
    methods: ['POST'],
    maxBodyBytes: 6 * 1024 * 1024,
  },
  'user-content': {
    access: 'member',
    loader: () => import('../_handlers/user-content.js'),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    maxBodyBytes: 512 * 1024,
  },
  'learner-state': {
    access: 'member',
    loader: () => import('../_handlers/learner-state.js'),
    methods: ['GET', 'POST'],
    maxBodyBytes: 1024 * 1024,
  },
  'revision-history': {
    access: 'member',
    loader: () => import('../_handlers/revision-history.js'),
    methods: ['GET', 'POST'],
    maxBodyBytes: 16 * 1024,
  },
  transcribe: {
    access: 'member',
    loader: () => import('../_handlers/transcribe.js'),
    methods: ['POST'],
    rawBody: true,
  },
  notebook: {
    access: 'member',
    loader: () => import('../_handlers/notebook.js'),
    methods: ['POST'],
  },
  'import-source': {
    access: 'member',
    loader: () => import('../_handlers/import-source.js'),
    methods: ['POST'],
    maxBodyBytes: 1_400_000,
  },
  'board-resource': {
    access: 'member',
    loader: () => import('../_handlers/board-resource.js'),
    methods: ['POST'],
  },
};

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const PAID_ROUTES = new Set(['ask', 'quiz', 'note', 'planner', 'paper-generator', 'review', 'transcribe', 'notebook', 'study-guide-chat', 'board-resource']);

/** Parse /api/<route> from Vercel request URLs when query.path is missing. */
function pathFromUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const pathname = url.split('?')[0];
  const apiMatch = pathname.match(/\/api\/(.+)$/);
  if (apiMatch) return apiMatch[1];
  // Catch-all handlers sometimes receive the segment path only.
  if (pathname.startsWith('/') && pathname !== '/api' && pathname !== '/api/') {
    return pathname.replace(/^\/+/, '');
  }
  return '';
}

export function resolveRouteKey(req) {
  const segments = req.query?.path;
  let key = '';

  if (Array.isArray(segments)) {
    key = segments.filter(Boolean).join('/');
  } else if (typeof segments === 'string' && segments.trim()) {
    key = segments.trim();
  }

  if (!key) {
    key = pathFromUrl(req.url);
  }

  return key.replace(/^\/+|\/+$/g, '') || 'health';
}

export async function ensureJsonBody(req, maxBytes = MAX_JSON_BODY_BYTES) {
  if (req.body !== undefined && req.body !== null) return;
  if (!BODY_METHODS.has(req.method)) return;

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('multipart/form-data')) return;

  const chunks = [];
  let totalBytes = 0;

  try {
    await new Promise((resolve, reject) => {
      req.on('data', (chunk) => {
        totalBytes += chunk.length;
        if (totalBytes > maxBytes) {
          reject(new Error('BODY_TOO_LARGE'));
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', resolve);
      req.on('error', reject);
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'BODY_TOO_LARGE') {
      req.body = null;
      req._bodyTooLarge = true;
      return;
    }
    throw err;
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) {
    req.body = {};
    return;
  }

  if (contentType.includes('application/json') || raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
    try {
      req.body = JSON.parse(raw);
      return;
    } catch {
      req.body = null;
      req._invalidJson = true;
      return;
    }
  }

  req.body = raw;
}

export async function dispatchRoute(routeKey, req, res) {
  const key = routeKey.replace(/^\/+|\/+$/g, '') || 'health';
  const route = Object.hasOwn(ROUTES, key) ? ROUTES[key] : null;

  if (!route) {
    res.status(404).json({
      error: 'API route not found',
    });
    return;
  }

  // Error responses from protected routes must never be shared-cacheable.
  if (route.access !== 'public') res.setHeader('Cache-Control', 'private, no-store');

  if (route.methods && !route.methods.includes(req.method)) {
    res.setHeader('Allow', route.methods.join(', '));
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // This is the deployed boundary for every handler, including newly added
  // routes. No handler module/provider or product store is reached beforehand.
  // Account controls intentionally remain available to denied/revoked owners.
  if (!['public', 'account', 'member', 'admin'].includes(route.access)) {
    res.status(503).json({ error: 'API access policy is not configured.' });
    return;
  }
  let user;
  if (route.access !== 'public') {
    user = await verifyAuthUser(req, res);
    if (!user) return;
    if (route.access !== 'account' && !(await requireVertexAccess(user, res))) return;
    if (route.access === 'admin' && !requireAdmin(user, res)) return;
  }

  if (!route.rawBody) {
    await ensureJsonBody(req, route.maxBodyBytes ?? MAX_JSON_BODY_BYTES);
  }

  if (req._bodyTooLarge) {
    res.status(413).json({ error: 'Request body too large.' });
    return;
  }

  if (req._invalidJson) {
    res.status(400).json({ error: 'Malformed JSON request body.' });
    return;
  }

  const mod = await route.loader();
  if (PAID_ROUTES.has(key)) await runAiUsageRequest(req, res, user, key, () => mod.default(req, res));
  else await mod.default(req, res);
}
