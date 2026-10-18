import { hasPublicationEvidence } from '../../contracts/contentPublication.js';

export function isPublishableGuide(entry) {
  return hasPublicationEvidence(entry);
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
