/**
 * Central API route registry — keeps Vercel Hobby deployments to a single Serverless Function.
 * Individual handlers live in api/_handlers/ (underscore-prefixed paths are not deployed as functions).
 */

import { MAX_JSON_BODY_BYTES } from './auth.js';
import { guardInterruptedRequestErrors } from './requestLifecycle.js';

export const API_VERSION = '1';

/** @type {Record<string, { loader: () => Promise<{ default: Function }>, methods?: string[], rawBody?: boolean, maxBodyBytes?: number }>} */
export const ROUTES = {
  health: {
    loader: () => import('../_handlers/health.js'),
    methods: ['GET', 'HEAD'],
  },
  telemetry: {
    loader: () => import('../_handlers/telemetry.js'),
    methods: ['POST'],
    maxBodyBytes: 8 * 1024,
  },
  'admin-status': {
    loader: () => import('../_handlers/admin-status.js'),
    methods: ['GET', 'HEAD'],
  },
  account: {
    loader: () => import('../_handlers/account.js'),
    methods: ['DELETE'],
  },
  'account-export': {
    loader: () => import('../_handlers/account-export.js'),
    methods: ['GET'],
  },
  waitlist: {
    loader: () => import('../_handlers/waitlist.js'),
    methods: ['POST'],
  },
  'waitlist-status': {
    loader: () => import('../_handlers/waitlist-status.js'),
    methods: ['GET'],
  },
  'signup-invite': {
    loader: () => import('../_handlers/signup-invite.js'),
    methods: ['POST'],
  },
  'waitlist-admin': {
    loader: () => import('../_handlers/waitlist-admin.js'),
    methods: ['POST'],
  },
  'study-guide-chat': {
    loader: () => import('../_handlers/study-guide-chat.js'),
    methods: ['POST'],
  },
  ask: {
    loader: () => import('../_handlers/ask.js'),
    methods: ['POST'],
  },
  agents: {
    loader: () => import('../_handlers/agents.js'),
    methods: ['GET'],
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
    loader: () => import('../_handlers/review-safe.ts'),
    methods: ['POST'],
    maxBodyBytes: 6 * 1024 * 1024,
  },
  'user-content': {
    loader: () => import('../_handlers/user-content.js'),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    maxBodyBytes: 512 * 1024,
  },
  'learner-state': {
    loader: () => import('../_handlers/learner-state.js'),
    methods: ['GET', 'POST'],
    maxBodyBytes: 1024 * 1024,
  },
  transcribe: {
    loader: () => import('../_handlers/transcribe.js'),
    methods: ['POST'],
    rawBody: true,
  },
  notebook: {
    loader: () => import('../_handlers/notebook.js'),
    methods: ['POST'],
  },
  'import-source': {
    loader: () => import('../_handlers/import-source.js'),
    methods: ['POST'],
    maxBodyBytes: 1_400_000,
  },
  'board-resource': {
    loader: () => import('../_handlers/board-resource.js'),
    methods: ['POST'],
  },
};

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

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

  if (req.aborted || req.destroyed || req.readableEnded) {
    guardInterruptedRequestErrors(req);
    throw new Error('BODY_INTERRUPTED');
  }

  const chunks = [];
  let totalBytes = 0;
  let raw;

  try {
    raw = await new Promise((resolve, reject) => {
      let settled = false;
      const releaseBody = () => {
        req.removeListener('data', onData);
        req.removeListener('end', onEnd);
        req.removeListener('aborted', onInterrupted);
      };
      const finish = (error) => {
        if (settled) return;
        settled = true;
        releaseBody();
        if (error) reject(error);
        else resolve(Buffer.concat(chunks, totalBytes).toString('utf8'));
        chunks.length = 0;
      };
      const onData = (chunk) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        totalBytes += buffer.length;
        if (totalBytes > maxBytes) {
          finish(new Error('BODY_TOO_LARGE'));
          return;
        }
        chunks.push(buffer);
      };
      const onEnd = () => finish();
      const onError = (error) => finish(error);
      const onInterrupted = () => finish(new Error('BODY_INTERRUPTED'));
      const onClose = () => {
        onInterrupted();
        req.removeListener('error', onError);
        req.removeListener('close', onClose);
      };
      req.on('data', onData);
      req.on('end', onEnd);
      req.on('aborted', onInterrupted);
      // Aborted/oversized bodies can still emit a transport error before close.
      // Keep only this guard and close cleanup after releasing retained bytes.
      req.on('error', onError);
      req.on('close', onClose);
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'BODY_TOO_LARGE') {
      req.body = null;
      req._bodyTooLarge = true;
      return;
    }
    throw err;
  }

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
  const route = ROUTES[key];

  if (!route) {
    res.status(404).json({
      error: 'API route not found',
    });
    return;
  }

  if (route.methods && !route.methods.includes(req.method)) {
    res.setHeader('Allow', route.methods.join(', '));
    res.status(405).json({ error: 'Method not allowed' });
    return;
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
  await mod.default(req, res);
}
