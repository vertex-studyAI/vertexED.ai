/**
 * VertexED UPI alert forwarder (Google Apps Script).
 *
 * Runs every minute in the Gmail account that receives your bank's credit
 * alerts and posts each new alert to /api/payment-alert. The server reads the
 * amount and UPI reference, matches the checkout and starts the buyer's plan.
 *
 * Setup (docs/UPI_PAYMENTS.md has the full walkthrough):
 * 1. script.google.com > New project > paste this file.
 * 2. Edit BANK_SENDERS and ENDPOINT below.
 * 3. Project Settings > Script properties > add PAYMENT_ALERT_SECRET with the
 *    same value as the Vercel environment variable.
 * 4. Run installTrigger once and accept the Gmail permission prompt.
 */

const ENDPOINT = 'https://www.vertexed.app/api/payment-alert';

// Exact sender addresses that email you when money arrives, and the domain
// that must sign them (DKIM). FamApp (@fam UPI IDs) sends "You received ₹..."
// receipts from no-reply@famapp.in. For a bank, add its alert address, for
// example { address: 'alerts@hdfcbank.net', dkimDomain: 'hdfcbank.net' }.
const BANK_SENDERS = [
  { address: 'no-reply@famapp.in', dkimDomain: 'famapp.in' },
];

const PROCESSED_KEY = 'processedMessageIds';
const MAX_REMEMBERED = 500;

function installTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'forwardBankAlerts')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger('forwardBankAlerts').timeBased().everyMinutes(1).create();
}

function forwardBankAlerts() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;
  try {
    const props = PropertiesService.getScriptProperties();
    const secret = props.getProperty('PAYMENT_ALERT_SECRET');
    if (!secret) throw new Error('Set PAYMENT_ALERT_SECRET in Script properties.');

    const processed = JSON.parse(props.getProperty(PROCESSED_KEY) || '[]');
    const seen = new Set(processed);
    const fromQuery = BANK_SENDERS.map(sender => sender.address).join(' OR ');
    const threads = GmailApp.search(`from:(${fromQuery}) newer_than:2d`, 0, 30);

    for (const thread of threads) {
      for (const message of thread.getMessages()) {
        const id = message.getId();
        if (seen.has(id)) continue;
        const sender = senderFor(message);
        if (!sender) { remember(processed, seen, id); continue; }
        if (!isAuthenticated(message, sender.dkimDomain)) {
          console.warn(`Skipped unauthenticated alert ${id}`);
          remember(processed, seen, id);
          continue;
        }

        const response = UrlFetchApp.fetch(ENDPOINT, {
          method: 'post',
          contentType: 'application/json',
          headers: { Authorization: `Bearer ${secret}` },
          muteHttpExceptions: true,
          payload: JSON.stringify({
            source: 'email',
            sender: message.getFrom(),
            subject: message.getSubject(),
            text: message.getPlainBody() || message.getBody(),
            receivedAt: message.getDate().toISOString(),
          }),
        });
        const status = response.getResponseCode();
        // 5xx and 429 are retried on the next run; anything else is final.
        if (status >= 500 || status === 429) continue;
        if (status === 401) throw new Error('The server rejected PAYMENT_ALERT_SECRET.');
        console.log(`Alert ${id}: ${status} ${response.getContentText().slice(0, 200)}`);
        remember(processed, seen, id);
      }
    }
    props.setProperty(PROCESSED_KEY, JSON.stringify(processed.slice(-MAX_REMEMBERED)));
  } finally {
    lock.releaseLock();
  }
}

// The bare address inside the From header. A display name can itself look like
// an address ("alerts@hdfcbank.net" <someone@else.com>), so the angle-bracket
// part wins, and the match must be exact.
function fromAddress(message) {
  const from = String(message.getFrom()).toLowerCase().trim();
  const bracketed = from.match(/<([^<>\s]+@[^<>\s]+)>\s*$/);
  if (bracketed) return bracketed[1];
  return /^[^\s<>@"]+@[^\s<>@"]+$/.test(from) ? from : '';
}

function senderFor(message) {
  const address = fromAddress(message);
  return BANK_SENDERS.find(sender => sender.address.toLowerCase() === address) || null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Gmail records whether the bank's domain really signed the message. This stops
// a forged "credited" email from someone else being forwarded. The signing
// domain must be the bank's domain or a subdomain of it, ending at a field
// boundary, so a lookalike such as hdfcbank.net.example.com fails.
function isAuthenticated(message, dkimDomain) {
  const results = String(message.getHeader('Authentication-Results') || '').toLowerCase();
  if (!/^\s*mx\.google\.com\s*;/.test(results)) return false;
  const domain = `(?:[a-z0-9-]+\\.)*${escapeRegExp(dkimDomain.toLowerCase())}(?=[\\s;)]|$)`;
  const dkimPass = new RegExp(`(?:^|;)\\s*dkim=pass\\b[^;]*\\bheader\\.(?:d=|i=@?(?:[^\\s;@]*@)?)${domain}`).test(results);
  const dmarcPass = new RegExp(`(?:^|;)\\s*dmarc=pass\\b[^;]*\\bheader\\.from=${domain}`).test(results);
  return dkimPass || dmarcPass;
}

function remember(processed, seen, id) {
  processed.push(id);
  seen.add(id);
}
