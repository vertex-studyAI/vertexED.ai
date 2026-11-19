import { useCallback, useEffect, useState } from 'react';
import { authFetch } from '@/lib/apiAuth';

type ReviewOrder = { id: string; email: string | null; plan: string; amount: string; claimedUtr: string | null; createdAt: string; updatedAt: string };
type UnmatchedAlert = { id: string; amount: string; utr: string; receivedAt: string; sender: string | null; excerpt: string | null };

const dateTime = (value: string) => new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

/** UPI payments the bank-alert matcher could not settle on its own. */
export default function PaymentReviewPanel() {
  const [orders, setOrders] = useState<ReviewOrder[]>([]);
  const [alerts, setAlerts] = useState<UnmatchedAlert[]>([]);
  const [utrs, setUtrs] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const call = useCallback(async (body: object) => {
    const response = await authFetch('/api/payment-admin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Payment review request failed.');
    return data;
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await call({ action: 'list' });
      setOrders(data.orders ?? []);
      setAlerts(data.alerts ?? []);
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payment review could not be loaded.');
    }
  }, [call]);

  useEffect(() => { void load(); }, [load]);

  const resolve = async (order: ReviewOrder, approve: boolean) => {
    setBusyId(order.id);
    try {
      const data = await call({ action: approve ? 'approve' : 'reject', orderId: order.id, utr: utrs[order.id] ?? order.claimedUtr ?? '' });
      setMessage(approve ? `Approved ${order.email ?? 'order'} until ${data.paidUntil ? dateTime(data.paidUntil) : 'the new end date'}.` : `Declined ${order.email ?? 'order'}.`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The order could not be updated.');
    } finally { setBusyId(null); }
  };

  return (
    <section className="mb-8 rounded-xl border border-border bg-card/40 p-4" aria-labelledby="payment-review-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="payment-review-heading" className="text-lg font-semibold">UPI payments to check</h2>
        <button type="button" className="neu-button px-3 py-1.5 text-sm" onClick={() => void load()}>Refresh</button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Approve only after you see the credit in your bank app with the same reference number.
      </p>
      {message && <p className="mt-3 text-sm" role="status">{message}</p>}

      {orders.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No payments are waiting for a check.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map(order => (
            <li key={order.id} className="rounded-lg border border-border p-3 text-sm">
              <p className="font-semibold">{order.email ?? 'Unknown account'} · {order.plan} · ₹{order.amount}</p>
              <p className="text-muted-foreground">Checkout opened {dateTime(order.createdAt)}. Buyer says UTR {order.claimedUtr ?? 'not given'}.</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor={`utr-${order.id}`}>UPI reference for {order.email}</label>
                <input
                  id={`utr-${order.id}`} inputMode="numeric" className="rounded-lg border border-border bg-background px-2 py-1 font-mono"
                  value={utrs[order.id] ?? order.claimedUtr ?? ''} onChange={event => setUtrs(current => ({ ...current, [order.id]: event.target.value }))}
                />
                <button type="button" className="neu-button px-3 py-1.5" disabled={busyId === order.id} onClick={() => void resolve(order, true)}>Approve</button>
                <button type="button" className="px-3 py-1.5 text-destructive underline" disabled={busyId === order.id} onClick={() => void resolve(order, false)}>Decline</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {alerts.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold">Bank credits with no matching checkout ({alerts.length})</summary>
          <ul className="mt-2 space-y-2 text-sm">
            {alerts.map(alert => (
              <li key={alert.id} className="rounded-lg border border-border p-2">
                <p><span className="font-semibold">₹{alert.amount}</span> · UTR <span className="font-mono">{alert.utr}</span> · {dateTime(alert.receivedAt)}</p>
                {alert.excerpt && <p className="mt-1 text-muted-foreground">{alert.excerpt}</p>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
