/**
 * Runs an OpenAI function-calling loop over a set of MCP tools.
 *
 * The model decides what to look up and can chain calls — search the wiki,
 * then pull the exact section it found — instead of answering from a single
 * pre-baked retrieval pass.
 *
 * MCP advertises tool inputs as JSON Schema, which is exactly what OpenAI's
 * `tools[].function.parameters` expects, so tool definitions pass through
 * without a lossy conversion step.
 */
const OPENAI_CHAT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/** Cap on a single tool result fed back to the model, in characters. */
const MAX_TOOL_RESULT_CHARS = 8000;

export class ToolLoopError extends Error {
  constructor(message, { status, detail } = {}) {
    super(message);
    this.name = 'ToolLoopError';
    this.status = status;
    this.detail = detail;
  }
}

/** MCP tool definitions -> OpenAI tool definitions. */
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

async function createChatCompletion({ apiKey, model, body, signal }) {
  const response = await fetch(OPENAI_CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, ...body }),
    signal,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ToolLoopError('OpenAI request failed', {
      status: response.status,
      detail: data?.error?.message,
    });
  }
  return data;
}

/**
 * @param {object} options
 * @param {string} options.apiKey
 * @param {string} options.model
 * @param {string} options.systemInstruction
 * @param {string} options.prompt              the user turn that starts the loop
 * @param {Array}  options.tools               MCP tool definitions from tools/list
 * @param {(name: string, args: object) => Promise<{ text: string, structured: unknown, isError: boolean }>} options.callTool
 * @param {number} [options.maxRounds]         tool-calling rounds before the model must answer (default 4)
 * @param {number} [options.maxTokens]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ answer: string, toolCalls: Array<{ name: string, args: object, structured: unknown, isError: boolean }> }>}
 */
export async function runMcpToolLoop({
  apiKey,
  model,
  systemInstruction,
  prompt,
  tools,
  callTool,
  maxRounds = 4,
  maxTokens = 900,
  signal,
}) {
  const openAiTools = toOpenAiTools(tools);
  const messages = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: prompt },
  ];
  const toolCalls = [];

  for (let round = 0; round <= maxRounds; round += 1) {
    const isFinalRound = round === maxRounds;
    const data = await createChatCompletion({
      apiKey,
      model,
      signal,
      body: {
        messages,
        // On the last round the tools are withdrawn so the model has to answer
        // from what it has already gathered rather than looping forever.
        ...(isFinalRound ? {} : { tools: openAiTools }),
        temperature: 0.2,
        max_tokens: maxTokens,
      },
    });

    const message = data?.choices?.[0]?.message;
    const requestedCalls = message?.tool_calls ?? [];

    if (requestedCalls.length === 0) {
      return { answer: (message?.content ?? '').trim(), toolCalls };
    }

    messages.push(message);

    for (const call of requestedCalls) {
      let args = {};
      let result;
      try {
        args = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
      } catch {
        // The model occasionally emits malformed JSON; tell it so rather than
        // failing the whole request, and let it retry on the next round.
        result = { text: 'Tool error: arguments were not valid JSON.', structured: null, isError: true };
      }

      if (!result) {
        try {
          result = await callTool(call.function.name, args);
        } catch (error) {
          result = { text: `Tool error: ${error?.message ?? 'unknown failure'}`, structured: null, isError: true };
        }
      }

      toolCalls.push({ name: call.function.name, args, structured: result.structured, isError: result.isError });
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: result.text.slice(0, MAX_TOOL_RESULT_CHARS),
      });
    }
  }

  return { answer: '', toolCalls };
}
