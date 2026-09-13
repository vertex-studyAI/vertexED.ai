/** Stateless routing. Never reads student profiles or shares conversation state. */
const ADVANCED_CAPABILITIES = new Set(['grading', 'paper-generator', 'exam-diagnosis']);
const KNOWN_CAPABILITIES = new Set(['chatbot', 'notebook', 'board-resource', 'grading', 'paper-generator', 'exam-diagnosis', 'quiz', 'note', 'flashcards', 'planner', 'study-guide-chat']);

export function routeAiRequest({ capability, text = '', provider = 'openai', defaultModel, maxTokens = 1200, env = process.env }) {
  if (!KNOWN_CAPABILITIES.has(capability)) throw new Error('Unknown AI capability');
  if (!defaultModel || !['openai', 'nvidia', 'google'].includes(provider)) throw new Error('Invalid routing configuration');
  const input = typeof text === 'string' ? text : '';
  const complex = ADVANCED_CAPABILITIES.has(capability) || input.length > 1800
    || /\b(prove|proof|evaluate critically|multi[- ]step|differential equation|partial fractions|compare and contrast|higher level|mark scheme)\b/i.test(input);
  const tier = complex ? 'advanced' : 'economy';
  const prefix = `AI_${provider.toUpperCase()}`;
  // Provider-scoped settings prevent accidentally sending another provider's ID.
  const specific = env[`${prefix}_${capability.toUpperCase().replaceAll('-', '_')}_MODEL`];
  const configured = specific || env[`${prefix}_${tier.toUpperCase()}_MODEL`];
  const model = typeof configured === 'string' && configured.trim() ? configured.trim() : defaultModel;
  const requestedCap = Number(env[`${prefix}_${tier.toUpperCase()}_MAX_TOKENS`]);
  const outputLimit = Number.isInteger(requestedCap) && requestedCap >= 256 && requestedCap <= 16000 ? requestedCap : maxTokens;
  return Object.freeze({ capability, provider, tier, model, maxTokens: Math.min(maxTokens, outputLimit), reason: complex ? 'capability-or-complexity' : 'routine-request' });
}
