import { getBearerToken, readJsonBody } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { checkRateLimit } from '../_lib/rateLimit.js';
import { getClientIp } from '../_lib/security.js';
import { normaliseAlertText, parseUpiCreditAlert } from '../_lib/upiAlertParser.js';
import { isValidAlertSecret } from '../_lib/upiPayments.js';

/**
 * Receives bank credit alerts from the owner's forwarder (Gmail Apps Script or
 * an SMS forwarder) and settles the matching checkout. Authenticated by the
 * PAYMENT_ALERT_SECRET shared secret; never by anything in the alert itself.
 */

function allowedSenderDomains(env = process.env) {
  return String(env.PAYMENT_ALERT_SENDERS || '')
    .split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
}

// The bare sender address. The angle-bracket part wins over the display name,
// which can itself look like an address.
function senderAddress(sender) {
  const value = String(sender || '').toLowerCase().trim();
  const bracketed = value.match(/<([^<>\s]+@[^<>\s]+)>\s*$/);
  if (bracketed) return bracketed[1];
  return /^[^\s<>@"]+@[^\s<>@"]+$/.test(value) ? value : '';
}

function senderAllowed(sender, domains) {
  if (!domains.length) return true;
  const domain = senderAddress(sender).split('@')[1];
  if (!domain) return false;
  return domains.some(allowed => domain === allowed || domain.endsWith(`.${allowed}`));
}

// Postgres errors that will never succeed on retry: bad input (22xxx),
// constraint violations (23xxx) and the functions' own validation (P0001).
function isPermanentError(error) {
  return /^(?:22|23)/.test(String(error?.code || '')) || error?.code === 'P0001';
}

const MAX_ALERT_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CLOCK_AHEAD_MS = 5 * 60 * 1000;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // The secret is checked first. Failed attempts are limited per IP; the real
  // forwarder has its own budget, so strangers sharing an Apps Script IP
  // cannot use it up.
  if (!isValidAlertSecret(getBearerToken(req))) {
    const failures = await checkRateLimit(`payment-alert-denied:${getClientIp(req)}`, 60, 60 * 60 * 1000);
    if (!failures.allowed) return res.status(429).json({ error: 'Too many attempts.' });
    return res.status(401).json({ error: 'Invalid forwarder secret.' });
  }
  const limit = await checkRateLimit('payment-alert:forwarder', 1200, 60 * 60 * 1000);
  if (!limit.allowed) return res.status(429).json({ error: 'Too many alerts.' });

  const body = readJsonBody(req);
  const source = body.source === 'sms' ? 'sms' : 'email';
  const sender = typeof body.sender === 'string' ? body.sender.slice(0, 200) : '';
  // Email alerts must come from the bank's domain. SMS sender IDs (AX-HDFCBK)
  // are not domains, so SMS relies on the secret held by the owner's phone.
  if (source === 'email' && !senderAllowed(sender, allowedSenderDomains())) {
    return res.status(202).json({ outcome: 'ignored', reason: 'sender_not_allowed' });
  }

  const receivedAt = new Date(typeof body.receivedAt === 'string' || typeof body.receivedAt === 'number' ? body.receivedAt : Date.now());
  if (Number.isNaN(receivedAt.getTime())) return res.status(400).json({ error: 'receivedAt is not a valid date.' });
  const age = Date.now() - receivedAt.getTime();
  if (age > MAX_ALERT_AGE_MS || age < -MAX_CLOCK_AHEAD_MS) {
    return res.status(422).json({ outcome: 'unreadable', reason: 'received_at_out_of_range' });
  }

  const text = normaliseAlertText([body.subject, body.text].filter(value => typeof value === 'string').join(' '));
  const parsed = parseUpiCreditAlert(text);
  if (!parsed.ok) return res.status(422).json({ outcome: 'unreadable', reason: parsed.reason });

  let supabase;
  try { supabase = getSupabaseAdmin(); } catch { return res.status(503).json({ error: 'Payments are not configured.' }); }

  const { data, error } = await supabase.rpc('record_payment_alert', {
    p_source: source,
    p_amount_paise: parsed.amountPaise,
    p_utr: parsed.utr,
    p_received_at: receivedAt.toISOString(),
    p_sender: sender || null,
    p_excerpt: text.slice(0, 600),
  });
  if (error) {
    console.error('payment-alert error:', error.code || 'UnknownError');
    if (isPermanentError(error)) return res.status(422).json({ outcome: 'rejected', reason: 'invalid_alert' });
    return res.status(503).json({ error: 'The alert could not be recorded. The forwarder should retry.' });
  }
  const result = Array.isArray(data) ? data[0] : data;
  return res.status(200).json({ outcome: result?.outcome ?? 'unmatched', amountPaise: parsed.amountPaise });
}
