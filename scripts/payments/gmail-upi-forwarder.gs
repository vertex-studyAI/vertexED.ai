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

// Exact sender addresses your bank uses for credit alerts, and the domain that
// must sign them (DKIM). Example for HDFC: alerts@hdfcbank.net / hdfcbank.net.
const BANK_SENDERS = [
  { address: 'alerts@hdfcbank.net', dkimDomain: 'hdfcbank.net' },
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

function senderFor(message) {
  const from = String(message.getFrom()).toLowerCase();
  return BANK_SENDERS.find(sender => from.includes(sender.address.toLowerCase())) || null;
}

// Gmail records whether the bank's domain really signed the message. This stops
// a forged "credited" email from someone else being forwarded.
function isAuthenticated(message, dkimDomain) {
  const results = String(message.getHeader('Authentication-Results') || '').toLowerCase();
  const domain = dkimDomain.toLowerCase();
  const dkimPass = new RegExp(`dkim=pass[^;]*header\\.(?:d|i)=@?(?:[a-z0-9-]+\\.)*${domain.replace(/\./g, '\\.')}`).test(results);
  const dmarcPass = new RegExp(`dmarc=pass[^;]*header\\.from=(?:[a-z0-9-]+\\.)*${domain.replace(/\./g, '\\.')}`).test(results);
  return dkimPass || dmarcPass;
}

function remember(processed, seen, id) {
  processed.push(id);
  seen.add(id);
}
