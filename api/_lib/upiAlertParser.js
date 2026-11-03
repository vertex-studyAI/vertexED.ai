/**
 * Reads an Indian bank's UPI credit alert (email or SMS) and returns the
 * credited amount and the 12-digit UPI reference (UTR/RRN).
 *
 * Bank wording differs, so this is deliberately conservative: debit alerts,
 * alerts without a credit verb and alerts with no unambiguous reference are
 * rejected rather than guessed at.
 */

// The currency word must stand alone, so "Customers 1800" is not read as Rs 1800.
const AMOUNT_RE = /(?:(?<![a-z0-9])(?:rs\.?|inr)|₹)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)(?![0-9])/gi;
const LABELLED_REF_RE = /(?:utr|rrn|ref(?:erence)?(?:\s*(?:no|number|id))?|upi(?:\s*ref(?:erence)?)?(?:\s*(?:no|number|id))?|transaction\s*(?:id|ref(?:erence)?)(?:\s*(?:no|number))?)\s*(?:is|:|-|\.|no\.?|#)?\s*:?\s*([0-9]{12})(?![0-9])/i;
const SLASHED_UPI_REF_RE = /upi\/(?:[a-z0-9]+\/)?([0-9]{12})(?![0-9])/i;
const BARE_REF_RE = /(?<![0-9])([0-9]{12})(?![0-9])/g;
const CREDIT_RE = /\b(?:credited|credit(?:ed)?\s+(?:of|by|with)|has\s+credit|received|deposited)\b/i;
const DEBIT_RE = /\b(?:debited|debit\s+of|withdrawn|spent|sent\s+to|paid\s+to)\b/i;
const NON_PAYMENT_AMOUNT_CONTEXT = /(?:bal(?:ance)?|limit|avl|available)[^0-9]{0,24}$/i;

export const MAX_ALERT_TEXT_CHARS = 4000;

export function normaliseAlertText(text) {
  return String(text ?? '')
    .slice(0, MAX_ALERT_TEXT_CHARS * 2)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#8377;|&#x20b9;/gi, '₹')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_ALERT_TEXT_CHARS);
}

function toPaise(raw) {
  const [rupees, fraction = ''] = raw.replace(/,/g, '').split('.');
  const value = Number(rupees) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function findAmountPaise(text) {
  for (const match of text.matchAll(AMOUNT_RE)) {
    const before = text.slice(Math.max(0, match.index - 40), match.index);
    if (NON_PAYMENT_AMOUNT_CONTEXT.test(before)) continue;
    return toPaise(match[1]);
  }
  return null;
}

function findUtr(text) {
  const labelled = text.match(LABELLED_REF_RE) ?? text.match(SLASHED_UPI_REF_RE);
  if (labelled) return labelled[1];
  const bare = [...new Set([...text.matchAll(BARE_REF_RE)].map(match => match[1]))];
  return bare.length === 1 ? bare[0] : null;
}

/**
 * @returns {{ ok: true, amountPaise: number, utr: string } | { ok: false, reason: string }}
 */
export function parseUpiCreditAlert(rawText) {
  const text = normaliseAlertText(rawText);
  if (!text) return { ok: false, reason: 'empty' };
  if (DEBIT_RE.test(text)) return { ok: false, reason: 'debit_alert' };
  if (!CREDIT_RE.test(text)) return { ok: false, reason: 'not_a_credit_alert' };
  const amountPaise = findAmountPaise(text);
  if (!amountPaise) return { ok: false, reason: 'amount_not_found' };
  const utr = findUtr(text);
  if (!utr) return { ok: false, reason: 'reference_not_found' };
  return { ok: true, amountPaise, utr };
}
