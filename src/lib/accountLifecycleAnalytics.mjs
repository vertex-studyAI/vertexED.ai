import { trackProductEvent } from "./productAnalytics.mjs";

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

export function isAccountDeletionRequest(input, method) {
  return method === "DELETE" && requestPathname(input) === "/api/account";
}

export function statusClass(status) {
  return Number.isInteger(status) && status >= 100 && status <= 599
    ? `${Math.floor(status / 100)}xx`
    : "unknown";
}

export function buildLogoutAnalyticsProperties({ outcome, backend = "supabase" }) {
  return {
    outcome: outcome === "success" ? "success" : "failure",
    backend: backend === "local" ? "local" : "supabase",
  };
}

export function buildAccountDeletionAnalyticsProperties({
  outcome,
  status,
  networkError = false,
}) {
  return {
    outcome: networkError
      ? "network_error"
      : outcome === "success"
        ? "success"
        : "failure",
    status_class: networkError ? "network" : statusClass(status),
  };
}

export function trackLogout(result) {
  trackProductEvent("Logout Completed", buildLogoutAnalyticsProperties(result));
}

export function trackAccountDeletion(result) {
  trackProductEvent(
    "Account Deletion Completed",
    buildAccountDeletionAnalyticsProperties(result),
  );
}
