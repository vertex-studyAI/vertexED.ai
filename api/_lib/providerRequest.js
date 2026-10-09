import { fetchProviderText } from './providerTextRequest.js';
import { logProviderRun } from './providerTelemetry.js';

/** Non-streaming provider request with bounded body reads and fixed-field telemetry. */
export async function fetchProvider({ capability, provider, model, url, options, timeoutMs = 30_000 }) {
  const startedAt = Date.now();
  let bufferedResponse;
  try {
    const { response } = await fetchProviderText(url, options, {
      timeoutMs,
      fetchImpl: async (requestUrl, requestOptions) => {
        const upstream = await fetch(requestUrl, requestOptions);
        // Retain native response metadata and a readable body while the shared
        // reader bounds consumption. Do not retain a late, discarded response.
        if (!requestOptions.signal.aborted) bufferedResponse = upstream.clone();
        return upstream;
      },
    });
    await logProviderRun({
      capability,
      provider,
      model,
      status: response.status,
      durationMs: Date.now() - startedAt,
    });
    return bufferedResponse;
  } catch (error) {
    // Both tee branches must be cancelled for the source stream to be released.
    // Cleanup cannot replace the provider error or wait beyond its deadline.
    try {
      Promise.resolve(bufferedResponse?.body?.cancel(error)).catch(() => {});
    } catch {
      // A custom body can throw synchronously while cancelling.
    }
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
