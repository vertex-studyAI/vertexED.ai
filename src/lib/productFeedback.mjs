export const PRODUCT_FEEDBACK_MAX_LENGTH = 1500;
export const PRODUCT_FEEDBACK_PATH_MAX_LENGTH = 160;
export const PRODUCT_FEEDBACK_CATEGORIES = Object.freeze([
  "bug",
  "confusing",
  "idea",
  "praise",
  "other",
]);

const CATEGORY_SET = new Set(PRODUCT_FEEDBACK_CATEGORIES);

function normalizeCategory(value) {
  if (typeof value !== "string") return "other";
  const normalized = value.trim().toLowerCase();
  return CATEGORY_SET.has(normalized) ? normalized : "other";
}

function normalizeRating(value) {
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

function normalizePagePath(value) {
  if (typeof value !== "string") return "/";
  const path = value.split(/[?#]/, 1)[0].trim();
  if (!path) return "/";
  const rooted = path.startsWith("/") ? path : `/${path}`;
  return rooted.slice(0, PRODUCT_FEEDBACK_PATH_MAX_LENGTH);
}

export function normalizeProductFeedback(input = {}) {
  const feedback = typeof input.feedback === "string"
    ? input.feedback.trim().slice(0, PRODUCT_FEEDBACK_MAX_LENGTH)
    : "";

  if (!feedback) {
    return { ok: false, error: "Feedback is required." };
  }

  return {
    ok: true,
    data: {
      category: normalizeCategory(input.category),
      rating: normalizeRating(input.rating),
      feedback,
      page_path: normalizePagePath(input.pagePath),
    },
  };
}

export function buildFeedbackAnalyticsProperties(input = {}) {
  return {
    category: normalizeCategory(input.category),
    rating: normalizeRating(input.rating),
    source: "in_product_launcher",
  };
}
