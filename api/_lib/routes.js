/**
 * Central API route registry — keeps Vercel Hobby deployments to a single Serverless Function.
 * Individual handlers live in api/_handlers/ (underscore-prefixed paths are not deployed as functions).
 */

export const API_VERSION = '1';

/** @type {Record<string, { loader: () => Promise<{ default: Function }>, methods?: string[], rawBody?: boolean }>} */
export const ROUTES = {
  health: {
    loader: () => import('../_handlers/health.js'),
    methods: ['GET', 'HEAD'],
  },
  waitlist: {
    loader: () => import('../_handlers/waitlist.js'),
    methods: ['POST'],
  },
  'waitlist-admin': {
    loader: () => import('../_handlers/waitlist-admin.js'),
    methods: ['POST'],
  },
  ask: {
    loader: () => import('../_handlers/ask.js'),
    methods: ['POST'],
  },
  quiz: {
    loader: () => import('../_handlers/quiz.js'),
    methods: ['POST'],
  },
  note: {
    loader: () => import('../_handlers/note.js'),
    methods: ['POST'],
  },
  planner: {
    loader: () => import('../_handlers/planner.js'),
    methods: ['POST'],
  },
  'paper-generator': {
    loader: () => import('../_handlers/paper-generator.js'),
    methods: ['POST'],
  },
  review: {
    loader: () => import('../_handlers/review.ts'),
    methods: ['POST'],
  },
  'review-post': {
    loader: () => import('../_handlers/review-post.js'),
    methods: ['POST'],
  },
  'user-content': {
    loader: () => import('../_handlers/user-content.js'),
    methods: ['GET', 'POST', 'DELETE'],
  },
  transcribe: {
    loader: () => import('../_handlers/transcribe.js'),
    methods: ['POST'],
    rawBody: true,
  },
};

const TEST_AGENTS_ROUTE = 'test-agents';
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function resolveRouteKey(req) {
  const segments = req.query?.path;
  let key = 'health';

  if (Array.isArray(segments)) {
    key = segments.filter(Boolean).join('/');
  } else if (typeof segments === 'string' && segments.trim()) {
    key = segments.trim();
  }

  return key.replace(/^\/+|\/+$/g, '') || 'health';
}

export function isTestAgentsEnabled() {
  if (process.env.ENABLE_TEST_AGENTS === 'true') return true;
  return process.env.VERCEL_ENV !== 'production';
}

export async function ensureJsonBody(req) {
  if (req.body !== undefined && req.body !== null) return;
  if (!BODY_METHODS.has(req.method)) return;

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('multipart/form-data')) return;

  const chunks = [];
  await new Promise((resolve, reject) => {
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', resolve);
    req.on('error', reject);
  });

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
      req.body = {};
      return;
    }
  }

  req.body = raw;
}

export async function dispatchRoute(routeKey, req, res) {
  const key = routeKey.replace(/^\/+|\/+$/g, '') || 'health';
  let route = ROUTES[key];

  if (!route && key === TEST_AGENTS_ROUTE && isTestAgentsEnabled()) {
    route = {
      loader: () => import('../../scripts/test-agents.ts'),
      methods: ['GET', 'POST'],
    };
  }

  if (!route) {
    res.status(404).json({
      error: 'API route not found',
      route: key,
      available: Object.keys(ROUTES),
    });
    return;
  }

  if (route.methods && !route.methods.includes(req.method)) {
    res.setHeader('Allow', route.methods.join(', '));
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!route.rawBody) {
    await ensureJsonBody(req);
  }

  const mod = await route.loader();
  await mod.default(req, res);
}
