import path from 'node:path';
import { MAX_AUDIO_BYTES } from './auth.js';

const MAX_MULTIPART_OVERHEAD = 512 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'audio/webm', 'video/webm', 'audio/mpeg', 'audio/mp4',
  'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/aac', 'audio/flac',
]);
const ALLOWED_NOTE_FORMATS = new Set([
  'Quick Notes', 'Cornell Notes', 'Research Oriented', 'Detailed Overview',
  'Bullet points/Summary', 'Mapping', 'Custom',
]);
const ALLOWED_LENGTHS = new Set(['short', 'medium', 'long']);

export class TranscriptionInputError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'TranscriptionInputError';
    this.status = status;
  }
}

async function readRawBody(req, maxBytes) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (req.body instanceof Uint8Array) return Buffer.from(req.body);
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  if (!req || typeof req.on !== 'function') {
    throw new TranscriptionInputError('Request body is unavailable.');
  }

  const chunks = [];
  let total = 0;
  await new Promise((resolve, reject) => {
    req.on('data', (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      total += buffer.length;
      if (total > maxBytes) {
        reject(new TranscriptionInputError('Audio upload too large (max 15 MB).', 413));
        return;
      }
      chunks.push(buffer);
    });
    req.on('end', resolve);
    req.on('error', reject);
  });
  return Buffer.concat(chunks);
}

function exactBoolean(value) {
  return value === true || value === 'true';
}

function boundedFlashCount(value) {
  const parsed = Number(value ?? 6);
  if (!Number.isInteger(parsed) || parsed < 4 || parsed > 16) {
    throw new TranscriptionInputError('flashCount must be an integer from 4 to 16.');
  }
  return parsed;
}

function normalizeFilename(value) {
  const base = path.basename(typeof value === 'string' ? value : 'recording.webm');
  const cleaned = base.replace(/[^A-Za-z0-9._-]/g, '_').slice(-120);
  return cleaned || 'recording.webm';
}

function normalizeMimeType(value, filename) {
  const mime = typeof value === 'string' ? value.split(';')[0].trim().toLowerCase() : '';
  if (ALLOWED_MIME_TYPES.has(mime)) return mime;
  const extension = path.extname(filename).toLowerCase();
  const inferred = {
    '.webm': 'audio/webm', '.mp3': 'audio/mpeg', '.mp4': 'audio/mp4',
    '.m4a': 'audio/mp4', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
    '.aac': 'audio/aac', '.flac': 'audio/flac',
  }[extension];
  if (inferred) return inferred;
  throw new TranscriptionInputError('Unsupported audio type. Use WebM, MP3, MP4/M4A, WAV, OGG, AAC, or FLAC.');
}

function parseBase64(value) {
  if (typeof value !== 'string' || !value || value.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw new TranscriptionInputError('audioBase64 must be valid base64.');
  }
  const buffer = Buffer.from(value, 'base64');
  if (!buffer.length) throw new TranscriptionInputError('Audio is empty.');
  return buffer;
}

function normalizedOptions(fields) {
  const noteFormat = typeof fields.noteFormat === 'string' ? fields.noteFormat : 'Quick Notes';
  const noteLength = typeof fields.length === 'string' ? fields.length : 'medium';
  if (!ALLOWED_NOTE_FORMATS.has(noteFormat)) {
    throw new TranscriptionInputError('Unsupported note format.');
  }
  if (!ALLOWED_LENGTHS.has(noteLength)) {
    throw new TranscriptionInputError('length must be short, medium, or long.');
  }
  const language = typeof fields.language === 'string' && fields.language.trim()
    ? fields.language.trim()
    : undefined;
  if (language && !/^[A-Za-z]{2,3}(?:-[A-Za-z]{2})?$/.test(language)) {
    throw new TranscriptionInputError('Invalid language code.');
  }
  return {
    language,
    createCards: exactBoolean(fields.createCards),
    flashCount: boundedFlashCount(fields.flashCount),
    summaryOnly: exactBoolean(fields.summaryOnly),
    createNotes: exactBoolean(fields.createNotes ?? fields.createNote),
    noteFormat,
    noteLength,
  };
}

function assertAudioSize(audioBuffer) {
  if (!audioBuffer.length) throw new TranscriptionInputError('Audio is empty.');
  if (audioBuffer.length > MAX_AUDIO_BYTES) {
    throw new TranscriptionInputError('Audio file too large (max 15 MB).', 413);
  }
}

export async function parseTranscriptionRequest(req) {
  const contentType = String(req.headers?.['content-type'] || '').toLowerCase();
  const contentLength = Number(req.headers?.['content-length'] || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_AUDIO_BYTES + MAX_MULTIPART_OVERHEAD) {
    throw new TranscriptionInputError('Audio upload too large (max 15 MB).', 413);
  }

  if (contentType.startsWith('multipart/form-data')) {
    const raw = await readRawBody(req, MAX_AUDIO_BYTES + MAX_MULTIPART_OVERHEAD);
    let form;
    try {
      form = await new Request('http://localhost/upload', {
        method: 'POST',
        headers: { 'content-type': String(req.headers['content-type']) },
        body: raw,
      }).formData();
    } catch {
      throw new TranscriptionInputError('Malformed multipart upload.');
    }
    const file = form.get('file') ?? form.get('audio');
    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
      throw new TranscriptionInputError('No audio file found in upload.');
    }
    const filename = normalizeFilename(file.name);
    const audioBuffer = Buffer.from(await file.arrayBuffer());
    assertAudioSize(audioBuffer);
    const fields = Object.fromEntries(
      ['language', 'createCards', 'flashCount', 'summaryOnly', 'createNotes', 'createNote', 'noteFormat', 'length']
        .map((key) => [key, form.get(key)]),
    );
    return {
      audioBuffer,
      filename,
      mimeType: normalizeMimeType(file.type, filename),
      ...normalizedOptions(fields),
    };
  }

  let body = req.body;
  if (!body || typeof body !== 'object' || Buffer.isBuffer(body)) {
    const raw = await readRawBody(req, MAX_AUDIO_BYTES + MAX_MULTIPART_OVERHEAD);
    try {
      body = JSON.parse(raw.toString('utf8'));
    } catch {
      throw new TranscriptionInputError('Malformed JSON request body.');
    }
  }
  const audioBuffer = parseBase64(body.audioBase64);
  assertAudioSize(audioBuffer);
  const filename = normalizeFilename(body.filename);
  return {
    audioBuffer,
    filename,
    mimeType: normalizeMimeType(body.mimeType, filename),
    ...normalizedOptions(body),
  };
}
