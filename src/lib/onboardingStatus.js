const VALID_BOARDS = new Set([
  "IB_MYP",
  "IB_DP",
  "IGCSE",
  "GCSE",
  "A_LEVELS",
  "AP",
  "CBSE",
  "ICSE",
]);

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,20}$/;

function readMetadataValue(metadata, flatKey, nestedKey) {
  if (!metadata || typeof metadata !== "object") return undefined;
  if (metadata[flatKey] !== undefined) return metadata[flatKey];

  const preferences = metadata.preferences;
  if (preferences && typeof preferences === "object") {
    return preferences[nestedKey];
  }

  return undefined;
}

function normalizeGrade(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Return the durable account-setup state used by every post-auth redirect.
 * Exam date remains optional; curriculum, grade, and at least one subject are
 * required because onboarding promises to create a usable first study plan.
 */
export function getOnboardingStatus(user) {
  const metadata = user?.user_metadata ?? {};
  const rawUsername = metadata.username;
  const username = typeof rawUsername === "string" ? rawUsername.trim() : "";

  const rawBoard = readMetadataValue(metadata, "board", "board");
  const rawGrade = readMetadataValue(metadata, "grade", "grade");
  const rawSubjects = readMetadataValue(metadata, "subjects", "subjects");

  const hasValidUsername = USERNAME_REGEX.test(username);
  const hasValidBoard = typeof rawBoard === "string" && VALID_BOARDS.has(rawBoard);
  const hasValidGrade = normalizeGrade(rawGrade) !== null;
  const hasSubjects = Array.isArray(rawSubjects)
    && rawSubjects.some((subject) => typeof subject === "string" && subject.trim().length > 0);

  return {
    hasValidUsername,
    hasValidBoard,
    hasValidGrade,
    hasSubjects,
    isComplete: hasValidUsername && hasValidBoard && hasValidGrade && hasSubjects,
  };
}

export function isOnboardingComplete(user) {
  return getOnboardingStatus(user).isComplete;
}
