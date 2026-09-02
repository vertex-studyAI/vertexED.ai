export const ACCOUNT_PASSWORD_MIN_LENGTH = 10;
export const ACCOUNT_PASSWORD_MAX_LENGTH = 128;

export function validateAccountPassword(password) {
  const value = typeof password === "string" ? password : "";
  if (value.length < ACCOUNT_PASSWORD_MIN_LENGTH) {
    return { ok: false, error: `Password must be at least ${ACCOUNT_PASSWORD_MIN_LENGTH} characters.` };
  }
  if (value.length > ACCOUNT_PASSWORD_MAX_LENGTH) {
    return { ok: false, error: `Password must be ${ACCOUNT_PASSWORD_MAX_LENGTH} characters or fewer.` };
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
    return { ok: false, error: "Password must include uppercase, lowercase, and a number." };
  }
  return { ok: true, error: null };
}
