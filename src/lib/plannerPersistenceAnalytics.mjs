import { trackProductEvent } from "./productAnalytics.mjs";

export function bucketPlannerTaskCount(taskCount) {
  if (!Number.isInteger(taskCount) || taskCount < 0) return "unknown";
  if (taskCount === 0) return "empty";
  if (taskCount <= 3) return "1_3";
  if (taskCount <= 7) return "4_7";
  if (taskCount <= 15) return "8_15";
  return "16_plus";
}

export function buildPlannerSaveAnalyticsProperties({ cloudSynced, taskCount }) {
  return {
    destination: cloudSynced ? "cloud" : "device",
    cloud_status: cloudSynced ? "saved" : "error",
    task_count_bucket: bucketPlannerTaskCount(taskCount),
  };
}

export function buildPlannerRetrieveAnalyticsProperties({
  source,
  cloudStatus,
  taskCount,
}) {
  const safeSource = ["cloud", "device", "empty"].includes(source) ? source : "unknown";
  const safeCloudStatus = ["available", "missing", "invalid", "error"].includes(cloudStatus)
    ? cloudStatus
    : "unknown";

  return {
    source: safeSource,
    cloud_status: safeCloudStatus,
    task_count_bucket: bucketPlannerTaskCount(taskCount),
  };
}

export function trackPlannerSaved(result) {
  trackProductEvent("Planner Saved", buildPlannerSaveAnalyticsProperties(result));
}

export function trackPlannerRetrieved(result) {
  trackProductEvent("Planner Retrieved", buildPlannerRetrieveAnalyticsProperties(result));
}
