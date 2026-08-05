import { trackProductEvent } from "./productAnalytics.mjs";

const AI_FEATURE_BY_PATH = Object.freeze({
  "/api/ask": "chatbot",
  "/api/study-guide-chat": "study_guide_chat",
  "/api/review": "answer_review",
  "/api/planner": "planner",
  "/api/note": "notes",
  "/api/quiz": "quiz",
  "/api/paper-generator": "paper",
  "/api/notebook": "notebook",
  "/api/transcribe": "transcription",
  "/api/board-resource": "board_resource",
});

function requestPathname(input) {
  if (typeof input === "string") {
    try {
      return new URL(input, "https://www.vertexed.app").pathname;
    } catch {
      return "";
    }
  }

  if (typeof URL !== "undefined" && input instanceof URL) {
    return input.pathname;
  }

  if (typeof Request !== "undefined" && input instanceof Request) {
    try {
      return new URL(input.url).pathname;
    } catch {
      return "";
    }
  }

  if (input && typeof input.url === "string") {
    try {
      return new URL(input.url, "https://www.vertexed.app").pathname;
    } catch {
      return "";
    }
  }

  return "";
}

export function getAiFeatureForRequest(input) {
  return AI_FEATURE_BY_PATH[requestPathname(input)] ?? null;
}

export function bucketAiRequestDuration(durationMs) {
  if (!Number.isFinite(durationMs) || durationMs < 0) return "unknown";
  if (durationMs < 1_000) return "under_1s";
  if (durationMs < 3_000) return "1_3s";
  if (durationMs < 10_000) return "3_10s";
  if (durationMs < 30_000) return "10_30s";
  return "over_30s";
}

export function buildAiRequestAnalyticsProperties({
  feature,
  status,
  durationMs,
  networkError = false,
}) {
  const validStatus = Number.isInteger(status) && status >= 100 && status <= 599;

  return {
    feature,
    outcome: networkError ? "network_error" : validStatus && status >= 200 && status < 300 ? "success" : "failure",
    status_class: networkError ? "network" : validStatus ? `${Math.floor(status / 100)}xx` : "unknown",
    duration_bucket: bucketAiRequestDuration(durationMs),
  };
}

export function trackAiRequestOutcome(input, result) {
  const feature = getAiFeatureForRequest(input);
  if (!feature) return;

  trackProductEvent(
    "AI Request Completed",
    buildAiRequestAnalyticsProperties({ feature, ...result }),
  );
}
