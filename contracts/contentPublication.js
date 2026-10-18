const present = (value) => typeof value === 'string' && value.trim().length > 0;
const known = (value) => present(value) && !['unknown', 'not-yet-determined'].includes(value.trim().toLowerCase());

/** Editorial approval is separate from authoring and machine validation. */
export function hasPublicationEvidence(entry, now = Date.now()) {
  const reviewedAt = Date.parse(entry?.reviewedAt);
  const reviewDueAt = entry?.reviewDueAt == null ? null : Date.parse(entry.reviewDueAt);
  return entry?.editorialStatus === 'approved'
    && entry?.publicationStatus === 'published'
    && present(entry.source) && present(entry.factualReviewer)
    && Number.isFinite(reviewedAt) && reviewedAt <= now
    && (reviewDueAt === null || (Number.isFinite(reviewDueAt) && reviewDueAt > now))
    && known(entry.license) && known(entry.permittedUse);
}

export function hasExactContentApproval(entry, contentHash, now = Date.now()) {
  return hasPublicationEvidence(entry, now)
    && /^sha256:[a-f0-9]{64}$/.test(contentHash)
    && entry.contentHash === contentHash
    && present(entry.contentVersion) && present(entry.answerVersion);
}
