/** A bounded, metered Chat Completions loop over the read-only wiki tools. */
import { fetchProvider } from './providerRequest.js';
import { createOpenAiHeaders } from './aiProviders.js';

export class ToolLoopError extends Error {
  constructor(message, { status } = {}) {
    super(message);
    this.name = 'ToolLoopError';
    this.status = status;
  }
}

export function toOpenAiTools(tools) {
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description ?? tool.title ?? tool.name,
      parameters: tool.inputSchema ?? { type: 'object', properties: {} },
    },
  }));
}

/** Bound even a dependency that does not settle promptly after cancellation. */
export async function withinWikiBudget(task, { signal, timeoutMs = 25000 } = {}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 30000) throw new ToolLoopError('Invalid tool-loop budget');
  signal?.throwIfAborted();
  const controller = new AbortController();
  const budgetSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
  let onAbort;
  const interrupted = new Promise((_, reject) => {
    onAbort = () => reject(budgetSignal.reason);
    budgetSignal.addEventListener('abort', onAbort, { once: true });
  });
  const timer = setTimeout(() => controller.abort(new ToolLoopError('Study guide time budget exhausted')), timeoutMs);
  try { return await Promise.race([Promise.resolve().then(() => task(budgetSignal)), interrupted]); }
  finally { clearTimeout(timer); budgetSignal.removeEventListener('abort', onAbort); }
}

async function createChatCompletion({ config, model, body, timeoutMs, signal }) {
  if (config?.name !== 'openai' || !config.apiKey || !config.baseUrl) {
    throw new ToolLoopError('Invalid wiki provider configuration');
  }
  const response = await fetchProvider({
    capability: 'study_guide_chat', provider: config.name, model, timeoutMs,
    url: `${config.baseUrl}/chat/completions`,
    options: {
      method: 'POST',
      headers: createOpenAiHeaders(config),
      body: JSON.stringify({ model, store: false, ...body }),
      signal,
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new ToolLoopError('Study guide provider request failed', { status: response.status });
  return data;
}

export async function runMcpToolLoop(options) {
  return withinWikiBudget(signal => runLoop({ ...options, signal }), options);
}

async function runLoop({
  config, model, systemInstruction, prompt, tools, callTool,
  maxRounds = 4, maxToolCalls = 8, maxTokens = 900, timeoutMs = 25000,
  signal, complete = createChatCompletion,
}) {
  if (!Number.isInteger(maxRounds) || maxRounds < 0 || maxRounds > 4
    || !Number.isInteger(maxToolCalls) || maxToolCalls < 1 || maxToolCalls > 8
    || !Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > 900
    || !Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 30000) {
    throw new ToolLoopError('Invalid tool-loop budget');
  }
  const openAiTools = toOpenAiTools(tools);
  const allowed = new Set(tools.map(tool => tool.name));
  const seenCalls = new Set();
  const messages = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: prompt },
  ];
  const toolCalls = [];
  const deadline = Date.now() + timeoutMs;

  for (let round = 0; round <= maxRounds; round += 1) {
    signal?.throwIfAborted();
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new ToolLoopError('Study guide time budget exhausted');
    const isFinalRound = round === maxRounds || toolCalls.length === maxToolCalls;
    const data = await complete({
      config, model, signal, timeoutMs: remaining,
      body: {
        messages,
        ...(isFinalRound ? {} : { tools: openAiTools }),
        temperature: 0.2,
        max_tokens: maxTokens,
      },
    });
    const choice = data?.choices?.[0];
    const message = choice?.message;
    if (message?.refusal || data?.error || (choice?.finish_reason && !['stop', 'tool_calls'].includes(choice.finish_reason))) {
      throw new ToolLoopError('Study guide provider returned incomplete output');
    }
    const requestedCalls = message?.tool_calls ?? [];
    if (!Array.isArray(requestedCalls)) throw new ToolLoopError('Invalid tool response');
    if (requestedCalls.length === 0) {
      if (typeof message?.content !== 'string') throw new ToolLoopError('Study guide provider returned no answer');
      return { answer: message.content.trim(), toolCalls };
    }
    // Withdrawing tools is not sufficient: reject a provider that still asks.
    if (isFinalRound || toolCalls.length + requestedCalls.length > maxToolCalls) {
      throw new ToolLoopError('Study guide tool budget exhausted');
    }
    for (const call of requestedCalls) {
      if (call?.type !== 'function' || typeof call.id !== 'string' || !call.id || seenCalls.has(call.id)) {
        throw new ToolLoopError('Invalid or duplicate tool call');
      }
      seenCalls.add(call.id);
    }
    messages.push({ role: 'assistant', content: typeof message.content === 'string' ? message.content : null, tool_calls: requestedCalls });
    for (const call of requestedCalls) {
      signal?.throwIfAborted();
      if (Date.now() >= deadline) throw new ToolLoopError('Study guide time budget exhausted');
      let args = {};
      let result;
      try {
        args = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
        if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error('object required');
      } catch {
        result = { text: 'Tool error: arguments must be a valid JSON object.', sources: [], isError: true };
      }
      if (!allowed.has(call.function?.name)) {
        result = { text: 'Tool error: that tool is not available.', sources: [], isError: true };
      }
      if (!result) {
        try { result = await callTool(call.function.name, args, { signal, timeoutMs: deadline - Date.now() }); }
        catch {
          signal?.throwIfAborted();
          result = { text: 'Tool error: the approved guide could not be read.', sources: [], isError: true };
        }
      }
      if (typeof result?.text !== 'string') throw new ToolLoopError('Invalid wiki tool result');
      toolCalls.push({ name: call.function?.name, args, sources: result.isError ? [] : (result.sources ?? []), structured: result.structured, isError: Boolean(result.isError) });
      messages.push({ role: 'tool', tool_call_id: call.id, content: result.text.slice(0, 8000) });
    }
  }
  throw new ToolLoopError('Study guide tool budget exhausted');
}
