/**
 * Normalize review workflow output into a consistent API shape for the client.
 */
export function normalizeReviewResponse(result) {
  if (result == null) {
    return {
      safe_text: '',
      output: '',
      blocked: false,
    };
  }

  if (typeof result === 'string') {
    const text = result.trim();
    return { safe_text: text, output: text, blocked: false };
  }

  if (typeof result !== 'object') {
    return { safe_text: '', output: '', blocked: false };
  }

  const passText =
    (typeof result.safe_text === 'string' && result.safe_text.trim()) ||
    (typeof result.passOutput?.safe_text === 'string' && result.passOutput.safe_text.trim()) ||
    (typeof result.output_text === 'string' && result.output_text.trim()) ||
    (typeof result.output === 'string' && result.output.trim()) ||
    '';

  if (passText) {
    return { safe_text: passText, output: passText, blocked: false };
  }

  const guardrailTriggered =
    result.pii?.failed ||
    result.moderation?.failed ||
    result.jailbreak?.failed ||
    result.hallucination?.failed ||
    result.nsfw?.failed ||
    result.url_filter?.failed ||
    result.custom_prompt_check?.failed ||
    result.prompt_injection?.failed;

  if (guardrailTriggered) {
    return {
      safe_text:
        'Your submission could not be reviewed because it triggered content safety checks. Remove personal information or inappropriate content and try again.',
      output: '',
      blocked: true,
      guardrails: result,
    };
  }

  const fallback = JSON.stringify(result, null, 2);
  return {
    safe_text: fallback,
    output: fallback,
    blocked: false,
  };
}
