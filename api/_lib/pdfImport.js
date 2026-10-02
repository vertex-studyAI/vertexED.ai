import { Worker } from 'node:worker_threads';
import { createHash } from 'node:crypto';

export const PDF_MAX_BYTES = 1_000_000;
export class PdfImportError extends Error {
  constructor(message, status = 422) { super(message); this.name = 'PdfImportError'; this.status = status; }
}

export function decodePdfRequest(body) {
  const encoded = body?.data;
  if (typeof encoded !== 'string' || !encoded.length || encoded.length > Math.ceil(PDF_MAX_BYTES / 3) * 4) {
    throw new PdfImportError('Choose a PDF of up to 1 MB.', 413);
  }
  if (encoded.length % 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw new PdfImportError('The PDF upload was incomplete. Choose the file again.', 400);
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.toString('base64') !== encoded || bytes.length > PDF_MAX_BYTES) throw new PdfImportError('The PDF upload was invalid or too large.', 400);
  if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new PdfImportError('This file is not a readable PDF. Export a fresh PDF and try again.');
  return bytes;
}

let activeWorkers = 0;
export async function extractPdf(bytes, { signal, timeoutMs = 15_000 } = {}) {
  if (signal?.aborted) throw new PdfImportError('Import cancelled.', 499);
  if (activeWorkers >= 2) throw new PdfImportError('PDF import is busy. Try again shortly.', 503);
  activeWorkers += 1;
  let worker;
  try {
    return await new Promise((resolve, reject) => {
      let settled = false;
      let timer;
      const finish = (error, result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
        Promise.resolve(worker?.terminate()).then(() => error ? reject(error) : resolve(result), () => reject(error ?? new PdfImportError('PDF extraction could not finish safely. Try again.')));
      };
      const abort = () => finish(new PdfImportError('Import cancelled.', 499));
      worker = new Worker(new URL('../_workers/pdfImportWorker.js', import.meta.url), {
        workerData: new Uint8Array(bytes),
        resourceLimits: { maxOldGenerationSizeMb: 128, maxYoungGenerationSizeMb: 16, stackSizeMb: 4 },
        stdout: true, stderr: true,
      });
      // Parser diagnostics can contain document text. Drain, but never log them.
      worker.stdout.resume(); worker.stderr.resume();
      timer = setTimeout(() => finish(new PdfImportError('This PDF took too long to read. Split it into a smaller file.', 422)), timeoutMs);
      signal?.addEventListener('abort', abort, { once: true });
      worker.once('message', result => result.error
        ? finish(new PdfImportError(result.error))
        : finish(null, { ...result, sha256: createHash('sha256').update(bytes).digest('hex') }));
      worker.once('error', () => finish(new PdfImportError('This PDF could not be read within the import limits. Export a smaller text-based PDF.')));
      worker.once('exit', () => finish(new PdfImportError('PDF extraction stopped before it completed. Try a smaller file.')));
      if (signal?.aborted) abort();
    });
  } finally { activeWorkers -= 1; }
}
