import { verifyAuthUser } from '../_lib/auth.js';
import { requireAdmin } from '../_lib/admin.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import {
  getReviewRecord,
  loadCurriculumReviewStore,
  readReviewResource,
} from '../_lib/curriculumReviewStore.js';

function queryValue(req, key) {
  const value = req.query?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function noStore(res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  noStore(res);
  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!requireAdmin(user, res)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'curriculum-review', res, { limit: 300, windowMs: 60 * 60 * 1000 }))) return;

  let store;
  try {
    store = await loadCurriculumReviewStore();
  } catch (error) {
    console.error('[curriculum-review] Store unavailable:', error instanceof Error ? error.code || error.name : 'UnknownError');
    return res.status(503).json({ error: 'Private curriculum review store is unavailable or failed integrity checks.' });
  }

  const action = queryValue(req, 'action') || 'list';
  if (action === 'list') {
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).json({
      state: 'private-review-only',
      digest: store.digest,
      counts: {
        packets: store.receipt.packets,
        records: store.receipt.records,
        lessons: store.receipt.lessons,
        workedExamples: store.receipt.workedExamples,
        questions: store.receipt.questions,
        teacherApproved: store.receipt.teacherApproved,
        runtimeExportRecords: store.receipt.runtimeExportRecords,
        productionImported: store.receipt.productionImported,
      },
      packets: store.packets,
      limits: {
        canApprove: false,
        canPublish: false,
        canImportToProduction: false,
        contentIsLearnerVisible: false,
      },
    });
  }

  if (action === 'record') {
    const record = getReviewRecord(store, queryValue(req, 'id'));
    if (!record) return res.status(404).json({ error: 'Private curriculum record not found.' });
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).json({ record, state: 'unreviewed-held', writable: false });
  }

  if (action === 'resource') {
    let resource;
    try {
      resource = await readReviewResource(store, queryValue(req, 'packet'), queryValue(req, 'resource'));
    } catch (error) {
      console.error('[curriculum-review] Resource integrity failure:', error instanceof Error ? error.code || error.name : 'UnknownError');
      return res.status(409).json({ error: 'Private curriculum resource failed integrity verification.' });
    }
    if (!resource) return res.status(404).json({ error: 'Private curriculum resource not found.' });
    res.setHeader('Content-Type', resource.mimeType);
    res.setHeader('Content-Length', String(resource.bytes.length));
    res.setHeader('Content-Disposition', `${resource.kind === 'document' ? 'attachment' : 'inline'}; filename="${resource.filename}"`);
    res.setHeader('X-Content-SHA256', resource.sha256);
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(resource.bytes);
  }

  return res.status(400).json({ error: 'Unknown review action.' });
}
