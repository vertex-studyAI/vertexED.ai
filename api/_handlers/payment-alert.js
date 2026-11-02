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

function senderAllowed(sender, domains) {
  if (!domains.length) return true;
  const address = String(sender || '').toLowerCase().match(/[^\s<>@]+@([^\s<>]+)/);
  if (!address) return false;
  return domains.some(domain => address[1] === domain || address[1].endsWith(`.${domain}`));
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const limit = await checkRateLimit(`payment-alert:${getClientIp(req)}`, 120, 60 * 60 * 1000);
  if (!limit.allowed) return res.status(429).json({ error: 'Too many alerts.' });

  if (!isValidAlertSecret(getBearerToken(req))) {
    return res.status(401).json({ error: 'Invalid forwarder secret.' });
  }

  const body = readJsonBody(req);
  const source = body.source === 'sms' ? 'sms' : 'email';
  const sender = typeof body.sender === 'string' ? body.sender.slice(0, 200) : '';
  if (!senderAllowed(sender, allowedSenderDomains())) {
    return res.status(202).json({ outcome: 'ignored', reason: 'sender_not_allowed' });
  }

  const receivedAt = new Date(typeof body.receivedAt === 'string' || typeof body.receivedAt === 'number' ? body.receivedAt : Date.now());
  if (Number.isNaN(receivedAt.getTime())) return res.status(400).json({ error: 'receivedAt is not a valid date.' });

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
    return res.status(503).json({ error: 'The alert could not be recorded. The forwarder should retry.' });
  }
  const result = Array.isArray(data) ? data[0] : data;
  return res.status(200).json({ outcome: result?.outcome ?? 'unmatched', amountPaise: parsed.amountPaise });
}
