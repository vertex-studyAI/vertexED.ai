import { fetchWithTimeout } from './fetchWithTimeout.js';
import { logProviderRun } from './providerTelemetry.js';

/** Provider request wrapper with a hard deadline and fixed-field telemetry only. */
export async function fetchProvider({ capability, provider, model, url, options, timeoutMs = 30_000 }) {
  const startedAt = Date.now();
  try {
    const response = await fetchWithTimeout(url, options, timeoutMs);
    await logProviderRun({
      capability,
      provider,
      model,
      status: response.status,
      durationMs: Date.now() - startedAt,
    });
    return response;
  } catch (error) {
    await logProviderRun({
      capability,
      provider,
      model,
      durationMs: Date.now() - startedAt,
      error: true,
    });
    throw error;
  }
}
