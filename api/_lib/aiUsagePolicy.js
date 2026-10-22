/** Reviewed official text-token prices and context bounds, 2026-10-16.
 * https://developers.openai.com/api/docs/models/gpt-4.1-mini
 * https://developers.openai.com/api/docs/models/gpt-4o-mini
 * https://developers.openai.com/api/docs/guides/token-counting
 * Reserve the entire context at uncached standard input rates, plus capped
 * output. This deliberately overstates cost; character estimates are not caps.
 */
export const AI_USAGE_POLICY = Object.freeze({ version: 'beta-usd-2026-10-16-v1', accountLimit: 1_000_000, projectLimit: 10_000_000, accountConcurrency: 2, projectConcurrency: 8, expiresAt: '2026-10-23T00:00:00.000Z' });
const MODELS = Object.freeze({
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
  if (!Number.isFinite(now) || now >= Date.parse(AI_USAGE_POLICY.expiresAt) || now < Date.parse('2026-10-16T00:00:00Z')) throw new AiUsageError();
}

function textOnly(value) {
  if (typeof value === 'string') return true;
  return Array.isArray(value) && value.every(part => part && ['text', 'input_text'].includes(part.type) && typeof part.text === 'string' && Object.keys(part).every(key => ['type', 'text'].includes(key)));
}

// This exception is only for the in-process, read-only wiki. It does not admit
// provider-hosted tools, arbitrary function schemas, or tool messages on other
// capabilities. These bounds are input limits, never token/cost estimates.
const WIKI_REQUEST_BYTES = 256 * 1024;
const WIKI_TOOLS = Object.freeze({
  list_wiki_pages: { required: [], properties: { subject: { type: 'string', maxLength: 120 } } },
  search_wiki: { required: ['query'], properties: { query: { type: 'string', minLength: 2, maxLength: 2000 }, subject: { type: 'string', maxLength: 120 }, limit: { type: 'integer', minimum: 1, maximum: 12 } } },
  read_wiki_page: { required: ['path'], properties: { path: { type: 'string', minLength: 1, maxLength: 512 }, max_chars: { type: 'integer', minimum: 500, maximum: 40000 } } },
  read_wiki_section: { required: ['path', 'section'], properties: { path: { type: 'string', minLength: 1, maxLength: 512 }, section: { type: 'string', minLength: 1, maxLength: 240 } } },
});
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const keysOnly = (value, keys) => record(value) && Object.keys(value).every(key => keys.includes(key));
const boundedText = (value, max) => typeof value === 'string' && value.length <= max;
const description = value => value === undefined || boundedText(value, 2048);

function wikiTools(tools) {
  if (!Array.isArray(tools) || !tools.length || tools.length > 4) throw unsupported();
  const seen = new Set();
  return tools.map(tool => {
    const fn = tool?.function;
    if (!keysOnly(tool, ['type', 'function']) || tool.type !== 'function'
      || !keysOnly(fn, ['name', 'description', 'parameters']) || !Object.hasOwn(WIKI_TOOLS, fn.name)
      || seen.has(fn.name) || !description(fn.description)) throw unsupported();
    seen.add(fn.name);
    const contract = WIKI_TOOLS[fn.name];
    const schema = fn.parameters;
    const required = schema?.required ?? [];
    if (!keysOnly(schema, ['type', 'properties', 'required', 'additionalProperties', '$schema']) || schema.type !== 'object'
      || !keysOnly(schema.properties, Object.keys(contract.properties))
      || Object.keys(schema.properties).length !== Object.keys(contract.properties).length
      || !Array.isArray(required) || required.length !== contract.required.length
      || new Set(required).size !== required.length || required.some(key => !contract.required.includes(key))
      || (schema.additionalProperties !== undefined && schema.additionalProperties !== false)
      || (schema.$schema !== undefined && !['http://json-schema.org/draft-07/schema#', 'https://json-schema.org/draft/2020-12/schema'].includes(schema.$schema))) throw unsupported();
    const properties = Object.fromEntries(Object.entries(contract.properties).map(([key, bounds]) => {
      const property = schema.properties[key];
      if (!keysOnly(property, [...Object.keys(bounds), 'description']) || property.type !== bounds.type
        || !description(property.description)
        || Object.keys(bounds).some(bound => property[bound] !== undefined && property[bound] !== bounds[bound])) throw unsupported();
      return [key, { ...bounds, ...(property.description === undefined ? {} : { description: property.description }) }];
    }));
    // Advertise the same bounded contract that is enforced on returned calls.
    return { type: 'function', function: { name: fn.name,
      ...(fn.description === undefined ? {} : { description: fn.description }),
      parameters: { type: 'object', properties, required: contract.required, additionalProperties: false } } };
  });
}

function wikiArguments(name, text) {
  if (!Object.hasOwn(WIKI_TOOLS, name) || !boundedText(text, 4096)) return false;
  let args;
  try { args = JSON.parse(text); } catch { return false; }
  const contract = WIKI_TOOLS[name];
  if (!keysOnly(args, Object.keys(contract.properties)) || contract.required.some(key => !Object.hasOwn(args, key))) return false;
  return Object.entries(args).every(([key, value]) => {
    const bounds = contract.properties[key];
    return bounds.type === 'string'
      ? typeof value === 'string' && value.length >= (bounds.minLength ?? 0) && value.length <= bounds.maxLength
      : Number.isSafeInteger(value) && value >= bounds.minimum && value <= bounds.maximum;
  });
}

function wikiMessages(messages) {
  // At most four assistant tool rounds and eight tool results, after the two
  // initial text messages. A partial, duplicate or orphan tool result is invalid.
  if (!Array.isArray(messages) || messages.length < 2 || messages.length > 14) return false;
  if (!['system', 'user'].every((role, index) => keysOnly(messages[index], ['role', 'content'])
    && messages[index].role === role && boundedText(messages[index].content, 16000))) return false;
  const seen = new Set();
  const pending = [];
  let rounds = 0;
  for (const message of messages.slice(2)) {
    if (message?.role === 'tool') {
      if (!keysOnly(message, ['role', 'tool_call_id', 'content']) || !pending.length
        || message.tool_call_id !== pending.shift() || !boundedText(message.content, 8000)) return false;
      continue;
    }
    if (pending.length || !keysOnly(message, ['role', 'content', 'tool_calls']) || message.role !== 'assistant'
      || (message.content !== null && !boundedText(message.content, 16000))
      || !Array.isArray(message.tool_calls) || !message.tool_calls.length
      || ++rounds > 4 || seen.size + message.tool_calls.length > 8) return false;
    for (const call of message.tool_calls) {
      if (!keysOnly(call, ['id', 'type', 'function']) || call.type !== 'function'
        || typeof call.id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(call.id) || seen.has(call.id)
        || !keysOnly(call.function, ['name', 'arguments']) || !wikiArguments(call.function.name, call.function.arguments)) return false;
      seen.add(call.id);
      pending.push(call.id);
    }
  }
  return pending.length === 0;
}

export function preparePaidRequest({ capability, provider, model, url, options }, now = Date.now()) {
  requireCurrentAiPolicy(now);
  const contract = Object.hasOwn(MODELS, model) ? MODELS[model] : null;
  if (provider !== 'openai' || !contract || !['https://api.openai.com/v1/responses', 'https://api.openai.com/v1/chat/completions'].includes(url) || options?.method !== 'POST' || typeof options.body !== 'string') throw unsupported();
  const wiki = capability === 'study_guide_chat' && url.endsWith('/chat/completions');
  if (wiki && Buffer.byteLength(options.body, 'utf8') > WIKI_REQUEST_BYTES) throw unsupported();
  let body;
  try { body = JSON.parse(options.body); } catch { throw unsupported(); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || body.model !== model) throw unsupported();
  const responses = url.endsWith('/responses');
  const allowed = responses
    ? ['model', 'input', 'instructions', 'max_output_tokens', 'store', 'safety_identifier', 'metadata', 'text', 'temperature', 'service_tier']
    : wiki ? ['model', 'messages', 'temperature', 'max_tokens', 'max_completion_tokens', 'store', 'tools', 'service_tier', 'n']
      : ['model', 'messages', 'temperature', 'max_tokens', 'max_completion_tokens', 'response_format', 'store', 'user', 'safety_identifier', 'metadata', 'service_tier', 'n'];
  if (Object.keys(body).some(key => !allowed.includes(key)) || (body.n !== undefined && body.n !== 1)) throw unsupported();
  const messages = responses ? body.input : body.messages;
  if (wiki) {
    if (!wikiMessages(messages)) throw unsupported();
    if (body.tools !== undefined) body.tools = wikiTools(body.tools);
  } else if (!(responses && typeof messages === 'string') && (!Array.isArray(messages) || !messages.length || !messages.every(message => message && ['system', 'developer', 'user', 'assistant'].includes(message.role) && textOnly(message.content) && Object.keys(message).every(key => ['role', 'content', 'type'].includes(key)) && (message.type === undefined || message.type === 'message')))) throw unsupported();
  if (body.instructions !== undefined && typeof body.instructions !== 'string') throw unsupported();
  const output = responses ? body.max_output_tokens : body.max_completion_tokens ?? body.max_tokens;
  if (!Number.isSafeInteger(output) || output < 16 || output > (wiki ? 900 : 4096) || (body.max_tokens !== undefined && body.max_completion_tokens !== undefined)) throw unsupported();
  // Pin aliases to the reviewed immutable identity, and disallow pricing tiers
  // selected automatically by the provider account configuration.
  body.model = contract.snapshot;
  body.service_tier = 'default';
  body.store = false;
  if (!responses) { delete body.max_tokens; body.max_completion_tokens = output; body.n = 1; }
  const serialized = JSON.stringify(body);
  if (wiki && Buffer.byteLength(serialized, 'utf8') > WIKI_REQUEST_BYTES) throw unsupported();
  // The full-context reservation includes EVERY input token: tool schemas,
  // descriptions, names, arguments, tool results and conversation text. Do not
  // subtract these or replace this bound with a character-based estimate.
  return { options: { ...options, redirect: 'error', body: serialized }, model: contract.snapshot, contract, output,
    reservedMicros: Number(tokenCost(contract.context, contract.inputRate) + tokenCost(output, contract.outputRate)), responses };
}

export function actualPaidCost(data, prepared) {
  const usage = data?.usage;
  const input = prepared.responses ? usage?.input_tokens : usage?.prompt_tokens;
  const output = prepared.responses ? usage?.output_tokens : usage?.completion_tokens;
  if (data?.model !== prepared.model || (data.service_tier !== undefined && data.service_tier !== 'default') || !Number.isSafeInteger(input) || input < 0 || input > prepared.contract.context || !Number.isSafeInteger(output) || output < 0 || output > prepared.output || !Number.isSafeInteger(usage.total_tokens) || usage.total_tokens !== input + output) throw new AiUsageError();
  const actual = Number(tokenCost(input, prepared.contract.inputRate) + tokenCost(output, prepared.contract.outputRate));
  if (actual > prepared.reservedMicros) throw new AiUsageError();
  return actual;
}
