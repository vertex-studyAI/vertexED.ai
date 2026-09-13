const CHAT_MODES = new Set(['quick', 'tutor', 'deep']);

function optionalModel(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

export function normalizeChatMode(value) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return CHAT_MODES.has(normalized) ? normalized : 'tutor';
}

export function resolveChatRoute({ mode, providerConfig, env = process.env }) {
  if (!providerConfig?.primaryModel) {
    throw new Error('Chat provider configuration must include a primary model');
  }

  const normalizedMode = normalizeChatMode(mode);
  const primaryByMode = {
    quick: optionalModel(env.CHATBOT_FAST_MODEL),
    tutor: optionalModel(env.CHATBOT_TUTOR_MODEL),
    deep: optionalModel(env.CHATBOT_REASONING_MODEL),
  };
  const fallbackByMode = {
    quick: optionalModel(env.CHATBOT_FAST_FALLBACK_MODEL),
    tutor: optionalModel(env.CHATBOT_TUTOR_FALLBACK_MODEL),
    deep: optionalModel(env.CHATBOT_REASONING_FALLBACK_MODEL),
  };

  return {
    mode: normalizedMode,
    primaryModel: primaryByMode[normalizedMode] || providerConfig.primaryModel,
    fallbackModel: fallbackByMode[normalizedMode] || providerConfig.fallbackModel || '',
  };
}
