/**
 * Safe user-facing copy for agent directory load failures.
 * Never surface raw provider/API messages in the panel.
 */
export function agentNetworkError(error) {
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  const message = source.toLowerCase();

  if (message.includes('401') || message.includes('unauthorized') || message.includes('sign in')) {
    return 'Sign in to load your linked OpenAI project agents.';
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
    return 'Too many directory requests were made. Wait a moment, then try again.';
  }
  if (message.includes('403') || message.includes('forbidden')) {
    return 'This account cannot load the agent directory right now.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout') || message.includes('abort')) {
    return 'VertexED could not reach the agent directory. Check your connection and try again.';
  }
  return 'The agent directory is temporarily unavailable.';
}
