import { randomUUID } from 'node:crypto';
import { runAiUsageContext } from '../../api/_lib/aiUsage.js';
export const AI_USER = '11111111-1111-4111-8111-111111111111';
export const AI_NOW = Date.parse('2026-10-16T12:00:00Z');
export function usageFixture(overrides = {}) {
  const calls = [];
  const reservations = new Map();
  const rpc = async (name, args) => {
    calls.push({ name, args });
    if (overrides[name]) return overrides[name](args);
    if (name === 'reserve_ai_usage') {
      const id = randomUUID(); reservations.set(id, { ...args, state: 'reserved' });
      return { allowed: true, reason: 'reserved', reservation_id: id, state: 'reserved', reserved_microusd: args.p_reserved_microusd };
    }
    const row = reservations.get(args.p_reservation_id);
    if (!row) throw new Error('Unknown fixture reservation');
    if (name === 'mark_ai_usage_dispatched') { row.state = 'dispatched'; return { allowed: true, reason: 'dispatched', state: 'dispatched' }; }
    if (name === 'settle_ai_usage') {
      row.state = args.p_outcome;
      return { ok: true, reason: 'settled', state: args.p_outcome, charged_microusd: args.p_outcome === 'succeeded' ? args.p_actual_microusd : args.p_outcome === 'failed' ? row.p_reserved_microusd : 0, reserved_microusd: args.p_outcome === 'uncertain' ? row.p_reserved_microusd : 0 };
    }
    throw new Error(`Unhandled fixture RPC ${name}`);
  };
  return { calls, rpc, run: (task, options = {}) => runAiUsageContext({ userId: AI_USER, operationId: randomUUID(), requestFingerprint: 'request-fixture', rpc, now: () => AI_NOW, ...options }, task) };
}
export function paidResponse(payload = {}, responses = true) {
  return Response.json({ model: 'gpt-4.1-mini-2025-04-14', service_tier: 'default', usage: responses ? { input_tokens: 20, output_tokens: 5, total_tokens: 25 } : { prompt_tokens: 20, completion_tokens: 5, total_tokens: 25 }, ...payload });
}
