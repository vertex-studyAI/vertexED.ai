import crypto from 'node:crypto';
import { isBillingConfigured, getPlanIdForRazorpayPlan } from '../_lib/razorpay.js';
import { upsertSubscription, findUserIdBySubscriptionId } from '../_lib/subscription.js';

/**
 * POST /api/billing-webhook  (Razorpay -> us)
 *
 * This is the ONLY writer of access-granting subscription state. The browser is
 * never trusted to report that it paid; access is granted here, after the
 * payload signature is verified.
 *
 * Registered with `rawBody: true` in _lib/routes.js because the signature is an
 * HMAC over the exact bytes Razorpay sent — re-serialising parsed JSON would
 * change them and every check would fail.
 *
 * Razorpay sends no Origin header, so enforceSameOriginCors() lets it through,
 * and there is no Authorization header — the signature is the authentication.
 */

const MAX_WEBHOOK_BYTES = 1024 * 1024;

function getRawBody(req) {
  // The Vite dev middleware consumes the stream before dispatch and hands the
  // exact bytes over as req.rawBody. On Vercel req is a real stream and this is
  // undefined, so we fall through and read it.
  if (req.rawBody) {
    return Promise.resolve(Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(req.rawBody));
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > MAX_WEBHOOK_BYTES) {
        reject(new Error('WEBHOOK_BODY_TOO_LARGE'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/** Constant-time compare so the check cannot be probed with timing. */
function isValidSignature(rawBody, signature, secret) {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const received = String(signature || '');
  if (received.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(received, 'utf8'));
  } catch {
    return false;
  }
}

function toIso(unixSeconds) {
  if (!unixSeconds && unixSeconds !== 0) return null;
  const ms = Number(unixSeconds) * 1000;
  if (!Number.isFinite(ms) || ms <= 0) return null;
  return new Date(ms).toISOString();
}

/** Flatten a Razorpay subscription entity into a row for our table. */
async function rowFromSubscription(entity) {
  const userId = entity?.notes?.supabase_user_id || (await findUserIdBySubscriptionId(entity?.id));
  if (!userId) return null;

  // While the subscription is still in its trial, charge_at is the date of the
  // first charge; afterwards current_end is the end of the paid period.
  const periodEnd = entity.current_end ?? entity.charge_at ?? entity.start_at;

  return {
    user_id: userId,
    provider: 'razorpay',
    provider_subscription_id: entity.id,
    status: entity.status,
    plan: getPlanIdForRazorpayPlan(entity.plan_id) ?? entity.notes?.plan ?? null,
    plan_id: entity.plan_id ?? null,
    current_period_end: toIso(periodEnd),
    trial_end: toIso(entity.start_at),
    cancel_at_period_end: Boolean(entity.ended_at) && entity.status !== 'cancelled',
  };
}

export default async function handler(req, res) {
  if (!isBillingConfigured()) {
    return res.status(503).json({ error: 'Billing is not configured on this server.' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('billing-webhook: RAZORPAY_WEBHOOK_SECRET is not set');
    return res.status(503).json({ error: 'Webhook is not configured.' });
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing x-razorpay-signature header.' });
  }

  let event;
  try {
    const rawBody = await getRawBody(req);
    if (!isValidSignature(rawBody, signature, webhookSecret)) {
      // Also covers a forged or replayed request, so keep the response opaque.
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }
    event = JSON.parse(rawBody.toString('utf8'));
  } catch (err) {
    console.error('billing-webhook parse error:', err instanceof Error ? err.message : err);
    return res.status(400).json({ error: 'Invalid webhook payload.' });
  }

  const entity = event?.payload?.subscription?.entity;

  try {
    switch (event.event) {
      // Mandate approved (trial begins), first charge taken, renewal charged,
      // or a lifecycle change. In every case the entity carries the current
      // status, so one upsert path handles them all.
      case 'subscription.authenticated':
      case 'subscription.activated':
      case 'subscription.charged':
      case 'subscription.updated':
      case 'subscription.pending':
      case 'subscription.halted':
      case 'subscription.paused':
      case 'subscription.resumed':
      case 'subscription.completed':
      case 'subscription.cancelled': {
        if (!entity) break;
        const row = await rowFromSubscription(entity);
        if (row) await upsertSubscription(row);

        if (event.event === 'subscription.halted') {
          // Retries exhausted — access is now revoked. Worth an email.
          console.warn(`Subscription halted for user ${row?.user_id} (${entity.id})`);
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // 500 tells Razorpay to retry, which is what we want for a transient
    // database failure — upserts are keyed on user_id, so replaying is harmless.
    console.error(`billing-webhook handler error (${event.event}):`, err instanceof Error ? err.message : err);
    return res.status(500).json({ error: 'Webhook handler failed.' });
  }

  return res.status(200).json({ received: true });
}
