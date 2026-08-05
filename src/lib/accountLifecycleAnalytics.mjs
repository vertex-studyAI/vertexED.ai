import { trackProductEvent } from "./productAnalytics.mjs";

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
