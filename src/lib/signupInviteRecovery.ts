export type InvalidInviteRecoveryState = {
  hasWaitlistInvite: boolean;
  loading: boolean;
  email: string;
  error: string | null;
};

export function shouldOfferInvalidInviteRecovery({
  hasWaitlistInvite,
  loading,
  email,
  error,
}: InvalidInviteRecoveryState) {
  return hasWaitlistInvite && !loading && email.trim().length === 0 && Boolean(error?.trim());
}
