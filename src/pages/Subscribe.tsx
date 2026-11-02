import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import SEO from '@/components/SEO';
import UpiQrCode from '@/components/payments/UpiQrCode';
import { authFetch } from '@/lib/apiAuth';

type Plan = 'monthly' | 'yearly';
type OrderStatus = 'pending' | 'paid' | 'expired' | 'needs_review' | 'rejected';
type Order = {
  id: string; plan: Plan; status: OrderStatus; amount: string; amountPaise: number;
  expiresAt: string; createdAt: string; claimedUtr: string | null; upiUri: string;
};
type Subscription = { plan: Plan; paidUntil: string };
type PaymentInfo = {
  plans: Record<Plan, { amount: string; amountPaise: number }>;
  payeeVpa: string; payeeName: string; access: boolean; canSubscribe: boolean;
  subscription: Subscription | null; order: Order | null;
};

const POLL_MS = 4000;
const PLAN_LABELS: Record<Plan, { title: string; period: string; detail: string }> = {
  monthly: { title: 'Monthly', period: 'per month', detail: '30 days of access from the day you pay.' },
  yearly: { title: 'Yearly', period: 'per year', detail: '365 days of access from the day you pay.' },
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function readJson(response: Response) {
  try { return await response.json(); } catch { return {}; }
}

function useCountdown(until: string | undefined) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!until) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [until]);
  const remaining = until ? Math.max(0, Math.floor((Date.parse(until) - now) / 1000)) : 0;
  return { remaining, label: `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` };
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="neu-button min-h-11 px-3 py-2 text-sm"
      onClick={async () => {
        try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
      }}
    >
      {copied ? 'Copied' : label}
    </button>
  );
}

export default function Subscribe() {
  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [plan, setPlan] = useState<Plan>('monthly');
  const [paidUntil, setPaidUntil] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [utr, setUtr] = useState('');
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const { remaining, label: countdown } = useCountdown(order?.status === 'pending' ? order.expiresAt : undefined);

  const load = useCallback(async () => {
    setError(null);
    const response = await authFetch('/api/payment');
    const data = await readJson(response);
    if (!response.ok) { setError(data.error || 'Payments could not be loaded.'); return; }
    setInfo(data);
    if (data.order) { setOrder(data.order); setPlan(data.order.plan); }
  }, []);

  useEffect(() => { void load().catch(() => setError('Payments could not be loaded. Check your connection.')); }, [load]);

  // Poll while a checkout is open; the server settles it when the bank alert arrives.
  useEffect(() => {
    if (!order || !['pending', 'expired', 'needs_review'].includes(order.status) || paidUntil) return;
    let active = true;
    const timer = window.setInterval(async () => {
      try {
        const response = await authFetch('/api/payment', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'status', orderId: order.id }),
        });
        if (!response.ok || !active) return;
        const data = await readJson(response);
        if (!active || !data.order) return;
        if (data.order.status === 'paid') setPaidUntil(data.subscription?.paidUntil ?? data.order.expiresAt);
        setOrder(current => (current?.id === data.order.id && current.status === data.order.status ? current : data.order));
      } catch { /* next tick retries */ }
    }, POLL_MS);
    return () => { active = false; window.clearInterval(timer); };
  }, [order, paidUntil]);

  useEffect(() => { if (paidUntil) successRef.current?.focus(); }, [paidUntil]);

  const startCheckout = async () => {
    setBusy(true); setError(null); setClaimMessage(null); setUtr('');
    try {
      const response = await authFetch('/api/payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', plan }),
      });
      const data = await readJson(response);
      if (!response.ok) { setError(data.error || 'The checkout could not be started.'); return; }
      setOrder(data.order);
    } catch {
      setError('The checkout could not be started. Check your connection.');
    } finally { setBusy(false); }
  };

  const submitClaim = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!order) return;
    setBusy(true); setClaimMessage(null);
    try {
      const response = await authFetch('/api/payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'claim', orderId: order.id, utr }),
      });
      const data = await readJson(response);
      if (data.outcome === 'paid') { setPaidUntil(data.paidUntil); return; }
      if (data.outcome === 'needs_review') {
        setOrder({ ...order, status: 'needs_review', claimedUtr: utr.replace(/\s+/g, '') });
        setClaimMessage('Thanks. Your payment is waiting for a manual check. Access starts as soon as it is confirmed, usually within a few hours.');
        return;
      }
      setClaimMessage(data.error || 'That reference number could not be checked.');
    } catch {
      setClaimMessage('The reference number could not be sent. Check your connection.');
    } finally { setBusy(false); }
  };

  const shell = (children: React.ReactNode) => (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <SEO title="Subscribe | VertexED" description="Pay for VertexED access with UPI." robots="noindex, nofollow" />
      {children}
    </div>
  );

  if (paidUntil) {
    return shell(
      <section className="glass-panel p-8 text-center" role="status" aria-live="polite">
        <p className="text-sm font-semibold text-primary">Payment received</p>
        <h1 ref={successRef} tabIndex={-1} className="mt-2 text-2xl font-semibold text-foreground">Your access is active</h1>
        <p className="mt-3 text-muted-foreground">Your plan runs until {formatDate(paidUntil)}.</p>
        <Link className="neu-button mt-6 inline-flex min-h-11 items-center px-5 py-2" to="/main">Go to your dashboard</Link>
      </section>,
    );
  }

  if (error && !info) {
    return shell(
      <section className="glass-panel p-8 text-center" role="alert">
        <h1 className="text-2xl font-semibold text-foreground">Payments are unavailable</h1>
        <p className="mt-3 text-muted-foreground">{error}</p>
        <button type="button" className="neu-button mt-5 min-h-11 px-4 py-2" onClick={() => void load()}>Try again</button>
      </section>,
    );
  }

  if (!info) return shell(<p className="text-center text-muted-foreground" role="status">Loading payment options</p>);

  if (!info.canSubscribe) {
    return shell(
      <section className="glass-panel p-8 text-center" role="alert">
        <h1 className="text-2xl font-semibold text-foreground">This account cannot buy access</h1>
        <p className="mt-3 text-muted-foreground">Verify your email address, or contact support if access was removed.</p>
        <Link className="mt-5 inline-flex min-h-11 items-center text-primary underline" to="/user-settings">Account and data controls</Link>
      </section>,
    );
  }

  const openOrder = order && ['pending', 'expired', 'needs_review'].includes(order.status) ? order : null;
  const expired = openOrder?.status === 'expired' || (openOrder?.status === 'pending' && remaining === 0);

  return shell(
    <>
      <header className="mb-6">
        <p className="text-sm font-semibold text-primary">VertexED access</p>
        <h1 className="mt-1 text-3xl font-semibold text-foreground">Pay with UPI</h1>
        {info.subscription ? (
          <p className="mt-2 text-muted-foreground">Your {info.subscription.plan} plan is active until {formatDate(info.subscription.paidUntil)}. Paying again adds time to the end of it.</p>
        ) : (
          <p className="mt-2 text-muted-foreground">Scan the code with any UPI app. Access starts automatically once your bank confirms the payment, usually within a minute.</p>
        )}
      </header>

      {!openOrder || (expired && openOrder.status !== 'needs_review' && !claimMessage) ? (
        <section className="glass-panel p-6" aria-labelledby="plan-heading">
          <h2 id="plan-heading" className="text-lg font-semibold text-foreground">Choose a plan</h2>
          {expired && <p className="mt-2 text-sm text-muted-foreground" role="status">The previous amount expired. If you already paid it, enter the reference number below instead of paying again.</p>}
          <fieldset className="mt-4 grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Plan</legend>
            {(Object.keys(PLAN_LABELS) as Plan[]).map(key => (
              <label key={key} className={`flex cursor-pointer flex-col rounded-lg border p-4 ${plan === key ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}>
                <span className="flex items-center gap-2">
                  <input type="radio" name="plan" value={key} checked={plan === key} onChange={() => setPlan(key)} />
                  <span className="font-semibold text-foreground">{PLAN_LABELS[key].title}</span>
                </span>
                <span className="mt-2 text-2xl font-semibold text-foreground">₹{Number(info.plans[key].amount).toFixed(0)} <span className="text-sm font-normal text-muted-foreground">{PLAN_LABELS[key].period}</span></span>
                <span className="mt-1 text-sm text-muted-foreground">{PLAN_LABELS[key].detail}</span>
              </label>
            ))}
          </fieldset>
          {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
          <button type="button" className="neu-button mt-5 min-h-11 px-5 py-2 disabled:opacity-60" disabled={busy} onClick={() => void startCheckout()}>
            {busy ? 'Preparing your code' : 'Continue to payment'}
          </button>
        </section>
      ) : null}

      {openOrder && openOrder.status === 'pending' && !expired && (
        <section className="glass-panel p-6" aria-labelledby="pay-heading">
          <h2 id="pay-heading" className="text-lg font-semibold text-foreground">Pay exactly ₹{openOrder.amount}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The paise are unique to your checkout. They are how we recognise your payment, so do not round the amount or change it.
          </p>
          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <UpiQrCode value={openOrder.upiUri} label={`UPI QR code to pay ₹${openOrder.amount} to ${info.payeeName}`} />
            <dl className="w-full space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="flex flex-wrap items-center gap-2 text-2xl font-semibold text-foreground">₹{openOrder.amount} <CopyButton value={openOrder.amount} label="Copy amount" /></dd>
              </div>
              <div>
                <dt className="text-muted-foreground">UPI ID</dt>
                <dd className="flex flex-wrap items-center gap-2 text-foreground"><span className="font-mono">{info.payeeVpa}</span> <CopyButton value={info.payeeVpa} label="Copy UPI ID" /></dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Reserved for</dt>
                <dd className="font-mono text-foreground" aria-live="off">{countdown}</dd>
              </div>
              <a className="inline-flex min-h-11 items-center text-primary underline" href={openOrder.upiUri}>Open a UPI app on this phone</a>
            </dl>
          </div>
          <p className="mt-5 text-sm text-muted-foreground" role="status" aria-live="polite">Waiting for your bank to confirm the payment. Keep this page open.</p>
        </section>
      )}

      {openOrder && (openOrder.status === 'needs_review' || expired || openOrder.status === 'pending') && (
        <details className="mt-6 rounded-lg border border-border p-4" open={openOrder.status === 'needs_review' || expired}>
          <summary className="cursor-pointer font-semibold text-foreground">Paid but still waiting?</summary>
          {openOrder.status === 'needs_review' ? (
            <p className="mt-3 text-sm text-muted-foreground" role="status">
              {claimMessage || `Reference ${openOrder.claimedUtr ?? ''} is waiting for a manual check. Access starts as soon as it is confirmed.`}
            </p>
          ) : (
            <form className="mt-3 space-y-3" onSubmit={submitClaim}>
              <label className="block text-sm text-foreground" htmlFor="utr">
                12-digit UPI reference number (UTR). Find it in your payment app under the transaction details.
              </label>
              <input
                id="utr" inputMode="numeric" autoComplete="off" pattern="[0-9 ]{12,15}" required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-base"
                value={utr} onChange={event => setUtr(event.target.value)}
              />
              <button type="submit" className="neu-button min-h-11 px-4 py-2 disabled:opacity-60" disabled={busy}>Check my payment</button>
              {claimMessage && <p className="text-sm text-muted-foreground" role="status">{claimMessage}</p>}
            </form>
          )}
        </details>
      )}
    </>,
  );
}
