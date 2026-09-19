/**
 * Allow only image sources that cannot execute script in the page.
 * Used for paper attachments, review uploads, and any user-influenced <img src>.
 */

const ALLOWED_DATA_IMAGE_RE =
  /^data:image\/(?:jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/i;

function isBlockedIpv4(parts) {
  if (parts.length !== 4) return true;
  if (parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function parseDottedIpv4(host) {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return null;
  return host.split('.').map((part) => Number(part));
}

/** Expand :: shorthand and return eight 16-bit groups, or null if invalid. */
function expandIpv6Groups(host) {
  if (!host.includes(':')) return null;
  if (/[^0-9a-f:]/i.test(host)) return null;

  const sides = host.split('::');
  if (sides.length > 2) return null;

  const parseSide = (side) => {
    if (!side) return [];
    return side.split(':').filter(Boolean);
  };

  let head;
  let tail;
  if (sides.length === 1) {
    head = parseSide(sides[0]);
    tail = [];
    if (head.length !== 8) return null;
  } else {
    head = parseSide(sides[0]);
    tail = parseSide(sides[1]);
    const missing = 8 - head.length - tail.length;
    if (missing < 1 && !(head.length === 0 && tail.length === 0)) {
      // "::" alone is valid (all zeros); otherwise :: must fill at least one group
      if (missing < 0) return null;
    }
    const fill = Math.max(0, 8 - head.length - tail.length);
    head = [...head, ...Array(fill).fill('0'), ...tail];
  }

  if (head.length !== 8) return null;
  const groups = [];
  for (const piece of head) {
    if (!/^[0-9a-f]{1,4}$/i.test(piece)) return null;
    groups.push(Number.parseInt(piece, 16));
  }
  return groups;
}

/** Map ::ffff:a.b.c.d or ::ffff:hhhh:hhhh onto four IPv4 octets. */
function ipv4MappedFromIpv6(groups) {
  // ::ffff:0:0/96 → groups[0..4] zero, groups[5] === 0xffff
  if (
    groups[0] === 0
    && groups[1] === 0
    && groups[2] === 0
    && groups[3] === 0
    && groups[4] === 0
    && groups[5] === 0xffff
  ) {
    return [
      (groups[6] >> 8) & 0xff,
      groups[6] & 0xff,
      (groups[7] >> 8) & 0xff,
      groups[7] & 0xff,
    ];
  }
  return null;
}

function isBlockedIpv6(host) {
  // Dotted-quad mapped form: ::ffff:127.0.0.1
  const dottedMapped = host.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (dottedMapped) {
    const parts = parseDottedIpv4(dottedMapped[1]);
    return !parts || isBlockedIpv4(parts);
  }

  const groups = expandIpv6Groups(host);
  if (!groups) {
    // Unparseable IPv6-looking hosts are denied (fail closed).
    return host.includes(':');
  }

  // Unspecified / loopback
  if (groups.every((g) => g === 0)) return true;
  if (
    groups[0] === 0 && groups[1] === 0 && groups[2] === 0 && groups[3] === 0
    && groups[4] === 0 && groups[5] === 0 && groups[6] === 0 && groups[7] === 1
  ) {
    return true;
  }

  // Link-local fe80::/10
  if ((groups[0] & 0xffc0) === 0xfe80) return true;
  // Unique local fc00::/7
  if ((groups[0] & 0xfe00) === 0xfc00) return true;
  // Multicast ff00::/8
  if ((groups[0] & 0xff00) === 0xff00) return true;

  const mapped = ipv4MappedFromIpv6(groups);
  if (mapped) return isBlockedIpv4(mapped);

  return false;
}

function isBlockedHostname(hostname) {
  const host = String(hostname || '')
    .toLowerCase()
    .replace(/\.$/, '')
    .replace(/^\[|\]$/g, '');
  if (!host) return true;
  if (
    host === 'localhost'
    || host.endsWith('.localhost')
    || host === 'metadata.google.internal'
    || host === 'metadata'
  ) {
    return true;
  }

  const ipv4 = parseDottedIpv4(host);
  if (ipv4) return isBlockedIpv4(ipv4);

  if (host.includes(':')) return isBlockedIpv6(host);

  return false;
}

/**
 * @param {unknown} value
 * @returns {string | undefined} navigable https or safe data:image src, else undefined
 */
export function safeImageSrc(value) {
  if (typeof value !== 'string') return undefined;
  const src = value.trim();
  if (!src) return undefined;

  if (ALLOWED_DATA_IMAGE_RE.test(src)) {
    return src;
  }

  try {
    const url = new URL(src);
    if (url.protocol !== 'https:') return undefined;
    if (url.username || url.password) return undefined;
    if (isBlockedHostname(url.hostname)) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

/**
 * Build a data URL only when mime + base64 are already allowlisted.
 * @param {string | null | undefined} mime
 * @param {string | null | undefined} b64
 */
export function safeDataImageSrc(mime, b64) {
  if (typeof mime !== 'string' || typeof b64 !== 'string') return undefined;
  const normalizedMime = mime.trim().toLowerCase() === 'image/jpg' ? 'image/jpeg' : mime.trim().toLowerCase();
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(normalizedMime)) {
    return undefined;
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64) || b64.startsWith('data:')) return undefined;
  return safeImageSrc(`data:${normalizedMime};base64,${b64}`);
}

export function isBlockedImageHostname(hostname) {
  return isBlockedHostname(hostname);
}
