export function isPublishableGuide(entry) {
  return entry?.editorialStatus === 'approved'
    && entry?.publicationStatus === 'published'
    && typeof entry.source === 'string' && entry.source.trim().length > 0
    && typeof entry.factualReviewer === 'string' && entry.factualReviewer.trim().length > 0
    && typeof entry.reviewedAt === 'string' && Number.isFinite(Date.parse(entry.reviewedAt))
    && typeof entry.license === 'string' && !['', 'unknown'].includes(entry.license.trim().toLowerCase())
    && typeof entry.permittedUse === 'string' && !['', 'not-yet-determined'].includes(entry.permittedUse.trim().toLowerCase());
}

export function publicationFilteredManifest(manifest, entries) {
  const approvedPaths = new Set(entries.filter(isPublishableGuide).map((entry) => entry.path));
  return {
    ...manifest,
    subjects: manifest.subjects
      .map((subject) => ({
        ...subject,
        pages: subject.pages.filter((page) => approvedPaths.has(page.path)),
      }))
      .filter((subject) => subject.pages.length > 0),
  };
}
