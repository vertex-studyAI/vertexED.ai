/**
 * Central API route registry — keeps Vercel Hobby deployments to a single Serverless Function.
 * Individual handlers live in api/_handlers/ (underscore-prefixed paths are not deployed as functions).
 */

export const API_VERSION = '1';

/** @type {Record<string, { loader: () => Promise<{ default: Function }>, methods?: string[], maxDuration?: number, rawBody?: boolean }>} */
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
    maxDuration: 60,
  },
  quiz: {
    loader: () => import('../_handlers/quiz.js'),
    methods: ['POST'],
    maxDuration: 60,
  },
  note: {
    loader: () => import('../_handlers/note.js'),
    methods: ['POST'],
    maxDuration: 30,
  },
  planner: {
    loader: () => import('../_handlers/planner.js'),
    methods: ['POST'],
    maxDuration: 60,
  },
  'paper-generator': {
    loader: () => import('../_handlers/paper-generator.js'),
    methods: ['POST'],
    maxDuration: 60,
  },
  review: {
    loader: () => import('../_handlers/review.ts'),
    methods: ['POST'],
    maxDuration: 60,
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
    maxDuration: 60,
    rawBody: true,
  },
};

const TEST_AGENTS_ROUTE = 'test-agents';

export function resolveRouteKey(req) {
  const segments = req.query?.path;
  if (Array.isArray(segments) && segments.length > 0) {
    return segments.join('/');
  }
  if (typeof segments === 'string' && segments) {
    return segments;
  }
  return 'health';
}

export function isTestAgentsEnabled() {
  if (process.env.ENABLE_TEST_AGENTS === 'true') return true;
  return process.env.VERCEL_ENV !== 'production';
}

export async function ensureJsonBody(req) {
  if (req.body !== undefined && req.body !== null) return;
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') return;

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('application/json')) return;

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
  try {
    req.body = JSON.parse(raw);
  } catch {
    req.body = {};
  }
}

export async function dispatchRoute(routeKey, req, res) {
  let key = routeKey;
  let route = ROUTES[key];

  if (!route && key === TEST_AGENTS_ROUTE && isTestAgentsEnabled()) {
    route = {
      loader: () => import('../../scripts/test-agents.ts'),
      methods: ['GET', 'POST'],
      maxDuration: 60,
    };
  }

  if (!route) {
    res.status(404).json({
      error: 'API route not found',
      route: routeKey,
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
