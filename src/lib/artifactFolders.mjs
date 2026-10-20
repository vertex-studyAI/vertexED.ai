export const ARTIFACT_FOLDER_MAX_LENGTH = 60;

export function normaliseArtifactFolder(value) {
  if (typeof value !== 'string') return null;
  const folder = value.trim().replace(/\s+/g, ' ').slice(0, ARTIFACT_FOLDER_MAX_LENGTH);
  return folder || null;
}

export function artifactFolder(item) {
  const organisation = item?.payload?.organisation;
  return normaliseArtifactFolder(organisation?.folder);
}

export function artifactFolderNames(items) {
  return [...new Set((Array.isArray(items) ? items : []).map(artifactFolder).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right));
}

/** Preserve a tool's payload while adding only namespaced library metadata. */
export function withArtifactFolder(payload, folder) {
  const nextFolder = normaliseArtifactFolder(folder);
  const source = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
  const existing = source.organisation && typeof source.organisation === 'object' && !Array.isArray(source.organisation)
    ? source.organisation
    : {};
  const organisation = { ...existing };
  if (nextFolder) organisation.folder = nextFolder;
  else delete organisation.folder;
  const next = { ...source };
  if (Object.keys(organisation).length) next.organisation = organisation;
  else delete next.organisation;
  return next;
}
