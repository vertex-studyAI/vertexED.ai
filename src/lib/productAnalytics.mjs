const MAX_EVENT_NAME_LENGTH = 80;
const MAX_PROPERTY_VALUE_LENGTH = 120;
const MAX_PROPERTIES = 8;

const BLOCKED_PROPERTY_KEY = /(?:email|username|full.?name|user.?id|password|token|secret|prompt|answer|content|message|query|invite.?code)/i;

export function normalizeAnalyticsEventName(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, MAX_EVENT_NAME_LENGTH);
}

export function sanitizeAnalyticsProperties(properties = {}) {
  const safeProperties = {};

  for (const [key, value] of Object.entries(properties)) {
    if (Object.keys(safeProperties).length >= MAX_PROPERTIES) break;
    if (!key || BLOCKED_PROPERTY_KEY.test(key)) continue;

    const safeKey = key.trim().slice(0, 60);
    if (!safeKey) continue;

    if (value === null || typeof value === "boolean") {
      safeProperties[safeKey] = value;
      continue;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      safeProperties[safeKey] = value;
      continue;
    }

    if (typeof value === "string") {
      safeProperties[safeKey] = value.trim().slice(0, MAX_PROPERTY_VALUE_LENGTH);
    }
  }

  return safeProperties;
}

export function trackProductEvent(name, properties = {}) {
  const eventName = normalizeAnalyticsEventName(name);
  if (!eventName || typeof window === "undefined") return;

  const safeProperties = sanitizeAnalyticsProperties(properties);
  void import("@vercel/analytics")
    .then(({ track }) => track(eventName, safeProperties))
    .catch(() => {
      // Product actions must never fail because analytics is unavailable,
      // blocked by the browser, or unsupported by the current Vercel plan.
    });
}
