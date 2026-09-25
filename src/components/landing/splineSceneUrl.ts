export function splineSceneUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'my.spline.design' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
