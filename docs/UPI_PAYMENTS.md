# Direct UPI payments

VertexED takes subscription payments straight into a personal UPI ID, with no
payment gateway and no company registration. Access starts automatically,
usually within a minute of payment.

## How it works

1. A signed-in student picks **Monthly** or **Yearly** on `/subscribe`.
2. The server reserves a unique amount for 15 minutes: the plan price plus
   1-99 paise (up to 499 when busy). Example: Rs 199.37. That amount is not
   handed to anyone else for twelve hours.
3. The page shows a UPI QR with that exact amount, plus the UPI ID and amount
   to copy. The student pays from any UPI app.
4. Your bank emails you a credit alert. A Google Apps Script in that Gmail
   account forwards it to `POST /api/payment-alert` every minute.
5. The server reads the amount and the 12-digit UPI reference (UTR), finds the
   one checkout with that amount, marks it paid and extends the student's
   subscription (`record_payment_alert` in
   `supabase/migrations/20261023120000_upi_payments.sql`). The open page polls
   and shows "Your access is active".

Access rule (`api/_lib/vertexAccess.js`): waitlist-approved accounts keep free
access. Any other account with `upi_subscriptions.paid_until` in the future has
access, unless an administrator revoked it.

### When automatic matching fails

- **Wrong amount, expired checkout or an unreadable alert.** The student
  enters the UTR from their UPI app under "Paid but still waiting?". If a
  stored alert has that UTR and amount, it settles at once. Otherwise the order
  appears under **UPI payments to check** on `/admin/waitlist`. Approve it only
  after you see the credit in your bank app with the same UTR.
- Every UTR settles at most one order. Replayed alerts return `duplicate`.

## Setup

### 1. Database

Apply the migration ledger as usual (see `docs/DATABASE_REPLAY.md`). It adds
`payment_orders`, `payment_alerts`, `upi_subscriptions` and four service-role-only
functions. The browser roles have no access to any of them.

### 2. Vercel environment variables

| Variable | Example | Notes |
| --- | --- | --- |
| `UPI_PAYEE_VPA` | `yourname@okhdfcbank` | The UPI ID that receives money. Payments stay off until this is set. |
| `UPI_PAYEE_NAME` | `VertexED` | Shown in the payer's app. |
| `UPI_PLAN_MONTHLY_PAISE` | `19900` | Rs 199. |
| `UPI_PLAN_YEARLY_PAISE` | `199900` | Rs 1,999. |
| `PAYMENT_ALERT_SECRET` | output of `openssl rand -hex 32` | At least 32 characters. |
| `PAYMENT_ALERT_SENDERS` | `hdfcbank.net` | Set this. Email alerts from any other sender domain are ignored. SMS alerts are not checked against it. |

### 3. Gmail forwarder

1. Make sure your bank emails you for **incoming** UPI credits. Send yourself
   Rs 1 from another UPI app to confirm, and note the sender address.
2. Open <https://script.google.com>, sign in with that Gmail account, create
   a project and paste `scripts/payments/gmail-upi-forwarder.gs`.
3. Set `BANK_SENDERS` to your bank's alert address and signing domain.
4. Under **Project Settings > Script properties**, add `PAYMENT_ALERT_SECRET`
   with the same value as in Vercel.
5. Run `installTrigger` once and allow the Gmail and external-request
   permissions. Open **Executions** to watch it run each minute.

The script forwards only messages whose sender address exactly matches
`BANK_SENDERS` and that Gmail shows as signed by the bank's domain (DKIM or
DMARC pass). A forged "credited" email, including one from a lookalike domain
such as `hdfcbank.net.example.com`, is skipped. The server checks the sender
domain again against `PAYMENT_ALERT_SENDERS`.

### SMS instead of email (optional)

Any forwarder that can POST JSON works. Send
`Authorization: Bearer <PAYMENT_ALERT_SECRET>` and a body like:

```json
{ "source": "sms", "sender": "AX-HDFCBK", "text": "<full SMS text>", "receivedAt": "2026-10-23T10:02:11+05:30" }
```

On iPhone, use a Shortcuts personal automation (Message contains "credited",
then Get Contents of URL). On Android, use an SMS-to-webhook forwarder app.
The phone must stay online. Include `receivedAt` when the forwarder can: an
alert that arrives more than twelve hours late is not matched automatically,
and the buyer enters the UTR instead. Anyone holding the secret can submit an
SMS alert, so keep it only on your own phone.

## Checking a new bank's wording

The alert reader (`api/_lib/upiAlertParser.js`) handles common HDFC, ICICI,
SBI, Kotak and Axis formats. It rejects debit alerts and alerts whose
reference is ambiguous. To add a bank, paste a real alert, with the account
number already masked, into a case in `tests/upi-payments.test.mjs` and run:

```bash
node --test tests/upi-payments.test.mjs
```

## Limits and cautions

- Bank alert wording can change. Watch the admin queue after any bank update.
- A savings account receiving many small payments can be queried by the bank.
  Payments received are income for tax purposes.
- Gmail checks run once a minute. Apps Script's daily trigger quota covers
  this on a normal Google account.
- To switch to a gateway later (for example Razorpay's QR Codes API), have its
  webhook call `resolve_payment_order` or a similar grant. The `/subscribe`
  page and access rule do not need to change.
