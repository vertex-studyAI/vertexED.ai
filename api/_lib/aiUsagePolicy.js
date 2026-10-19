/** Reviewed official text-token prices and context bounds, 2026-10-19.
 * https://developers.openai.com/api/docs/models/gpt-6-luna
 * https://developers.openai.com/api/docs/models/gpt-4o-mini
 * https://developers.openai.com/api/docs/guides/latest-model
 * https://developers.openai.com/api/docs/guides/token-counting
 * Reserve the entire context at uncached standard input rates, plus capped
 * output. This deliberately overstates cost; character estimates are not caps.
 */
export const AI_USAGE_POLICY = Object.freeze({ version: 'beta-usd-2026-10-19-v2', accountLimit: 1_000_000, projectLimit: 10_000_000, accountConcurrency: 2, projectConcurrency: 8, expiresAt: '2026-10-26T00:00:00.000Z' });
const MODELS = Object.freeze({
  // OpenAI currently documents only the rolling Luna alias. Accept an exact
  // alias or a dated provider identity, and force this short-lived policy to
  // expire closed so pricing cannot silently drift.
  'gpt-6-luna': { snapshot: 'gpt-6-luna', responsePrefix: 'gpt-6-luna', context: 1_050_000, inputRate: 100_000, outputRate: 500_000, longContextThreshold: 272_000, longInputRate: 200_000, longOutputRate: 750_000, reasoning: true },
  'gpt-4.1-mini': { snapshot: 'gpt-4.1-mini-2025-04-14', context: 1_047_576, inputRate: 400_000, outputRate: 1_600_000 },
  'gpt-4.1-mini-2025-04-14': { snapshot: 'gpt-4.1-mini-2025-04-14', context: 1_047_576, inputRate: 400_000, outputRate: 1_600_000 },
  'gpt-4o-mini': { snapshot: 'gpt-4o-mini-2024-07-18', context: 128_000, inputRate: 150_000, outputRate: 600_000 },
  'gpt-4o-mini-2024-07-18': { snapshot: 'gpt-4o-mini-2024-07-18', context: 128_000, inputRate: 150_000, outputRate: 600_000 },
});

export class AiUsageError extends Error {
  constructor(code = 'AI_USAGE_UNAVAILABLE', status = 503, message = 'AI usage is temporarily unavailable.', retryAfter = 30) {
    super(message); this.name = 'AiUsageError'; this.code = code; this.status = status; this.retryAfter = retryAfter;
  }
}
const unsupported = () => new AiUsageError('AI_MODEL_UNSUPPORTED', 503, 'This model or input type is unavailable under the current AI allowance.');
const tokenCost = (tokens, rate) => (BigInt(tokens) * BigInt(rate) + 999_999n) / 1_000_000n;

export function requireCurrentAiPolicy(now = Date.now()) {
  if (!Number.isFinite(now) || now >= Date.parse(AI_USAGE_POLICY.expiresAt) || now < Date.parse('2026-10-19T00:00:00Z')) throw new AiUsageError();
}

function textOnly(value) {
  if (typeof value === 'string') return true;
  return Array.isArray(value) && value.every(part => part && ['text', 'input_text'].includes(part.type) && typeof part.text === 'string' && Object.keys(part).every(key => ['type', 'text'].includes(key)));
}

export function preparePaidRequest({ provider, model, url, options }, now = Date.now()) {
  requireCurrentAiPolicy(now);
  const contract = Object.hasOwn(MODELS, model) ? MODELS[model] : null;
  if (provider !== 'openai' || !contract || !['https://api.openai.com/v1/responses', 'https://api.openai.com/v1/chat/completions'].includes(url) || options?.method !== 'POST' || typeof options.body !== 'string') throw unsupported();
  let body;
  try { body = JSON.parse(options.body); } catch { throw unsupported(); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || body.model !== model) throw unsupported();
  const responses = url.endsWith('/responses');
  const allowed = responses
    ? ['model', 'input', 'instructions', 'max_output_tokens', 'store', 'safety_identifier', 'metadata', 'text', 'temperature', 'service_tier', 'reasoning']
    : ['model', 'messages', 'temperature', 'max_tokens', 'max_completion_tokens', 'response_format', 'store', 'user', 'safety_identifier', 'metadata', 'service_tier', 'n', 'reasoning_effort'];
  if (Object.keys(body).some(key => !allowed.includes(key)) || (body.n !== undefined && body.n !== 1)) throw unsupported();
  const messages = responses ? body.input : body.messages;
  if (!(responses && typeof messages === 'string') && (!Array.isArray(messages) || !messages.length || !messages.every(message => message && ['system', 'developer', 'user', 'assistant'].includes(message.role) && textOnly(message.content) && Object.keys(message).every(key => ['role', 'content', 'type'].includes(key)) && (message.type === undefined || message.type === 'message')))) throw unsupported();
  if (body.instructions !== undefined && typeof body.instructions !== 'string') throw unsupported();
  if (body.reasoning !== undefined && (!contract.reasoning || !body.reasoning || typeof body.reasoning !== 'object' || Array.isArray(body.reasoning) || body.reasoning.effort !== 'none' || Object.keys(body.reasoning).some(key => key !== 'effort'))) throw unsupported();
  if (body.reasoning_effort !== undefined && (!contract.reasoning || body.reasoning_effort !== 'none')) throw unsupported();
  const output = responses ? body.max_output_tokens : body.max_completion_tokens ?? body.max_tokens;
  if (!Number.isSafeInteger(output) || output < 16 || output > 4096 || (body.max_tokens !== undefined && body.max_completion_tokens !== undefined)) throw unsupported();
  // Pin aliases to the reviewed immutable identity, and disallow pricing tiers
  // selected automatically by the provider account configuration.
  body.model = contract.snapshot;
  body.service_tier = 'default';
  body.store = false;
  if (contract.reasoning) {
    if (responses) body.reasoning = { effort: 'none' };
    else body.reasoning_effort = 'none';
  }
  if (!responses) { delete body.max_tokens; body.max_completion_tokens = output; body.n = 1; }
  const reservationInputRate = contract.longInputRate ?? contract.inputRate;
  const reservationOutputRate = contract.longOutputRate ?? contract.outputRate;
  return { options: { ...options, redirect: 'error', body: JSON.stringify(body) }, model: contract.snapshot, contract, output,
    reservedMicros: Number(tokenCost(contract.context, reservationInputRate) + tokenCost(output, reservationOutputRate)), responses };
}

export function actualPaidCost(data, prepared) {
  const usage = data?.usage;
  const input = prepared.responses ? usage?.input_tokens : usage?.prompt_tokens;
  const output = prepared.responses ? usage?.output_tokens : usage?.completion_tokens;
  const identityMatches = data?.model === prepared.model
    || (prepared.contract.responsePrefix && typeof data?.model === 'string' && new RegExp(`^${prepared.contract.responsePrefix}-\\d{4}-\\d{2}-\\d{2}$`).test(data.model));
  if (!identityMatches || (data.service_tier !== undefined && data.service_tier !== 'default') || !Number.isSafeInteger(input) || input < 0 || input > prepared.contract.context || !Number.isSafeInteger(output) || output < 0 || output > prepared.output || !Number.isSafeInteger(usage.total_tokens) || usage.total_tokens !== input + output) throw new AiUsageError();
  const longContext = prepared.contract.longContextThreshold && input > prepared.contract.longContextThreshold;
  const inputRate = longContext ? prepared.contract.longInputRate : prepared.contract.inputRate;
  const outputRate = longContext ? prepared.contract.longOutputRate : prepared.contract.outputRate;
  const actual = Number(tokenCost(input, inputRate) + tokenCost(output, outputRate));
  if (actual > prepared.reservedMicros) throw new AiUsageError();
  return actual;
}
