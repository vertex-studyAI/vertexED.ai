export function parseTodayPlanDone(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const normalized = {};
    for (const [day, ids] of Object.entries(parsed)) {
      if (!Array.isArray(ids)) continue;
      const clean = ids.filter((id) => typeof id === 'string' && id.trim()).slice(0, 200);
      normalized[day] = [...new Set(clean)];
    }
    return normalized;
  } catch {
    return {};
  }
}
