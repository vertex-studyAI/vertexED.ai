import { parentPort, workerData } from 'node:worker_threads';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

let loading;
try {
  loading = getDocument({
    data: workerData, isEvalSupported: false, useWasm: false, useWorkerFetch: false,
    disableFontFace: true, useSystemFonts: false, stopAtErrors: true,
    disableAutoFetch: true, verbosity: 0,
  });
  const document = await loading.promise;
  if (document.numPages > 25) throw new Error('Choose a PDF with at most 25 pages. Split longer documents before importing.');
  if (document.isPureXfa) throw new Error('This form-based PDF is not supported. Export its text to a standard PDF first.');
  const pages = [];
  const blankPages = [];
  let content = '';
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const reader = page.streamTextContent().getReader();
    let text = '';
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        for (const item of chunk.value.items) {
          if (typeof item.str !== 'string') continue;
          text += item.str + (item.hasEOL ? '\n' : ' ');
          if (content.length + text.length > 50_000) throw new Error('This PDF contains more than 50,000 characters. Split it into smaller sources.');
        }
      }
    } finally {
      // PDF.js requires an Error reason to mark its stream closed before queued
      // messages arrive. Cancelling without one can race the bounded result.
      await reader.cancel(new Error('PDF text extraction stopped.')).catch(() => {});
      page.cleanup();
    }
    text = text.trim();
    if (!text) blankPages.push(pageNumber);
    pages.push({ page: pageNumber, text });
    content += `${content ? '\n\n' : ''}[Page ${pageNumber}]\n${text || '[No extractable text on this page]'}`;
    if (content.length > 50_000) throw new Error('This PDF contains more than 50,000 characters. Split it into smaller sources.');
  }
  if (blankPages.length === document.numPages) throw new Error('No selectable text was found. Scanned pages, handwriting and images need text transcription before import.');
  parentPort.postMessage({ content, pageCount: document.numPages, pages, blankPages });
} catch (error) {
  const message = error?.name === 'PasswordException'
    ? 'Encrypted or password-protected PDFs are not supported. Export an unlocked copy you have permission to use.'
    : error?.name === 'Error' && /^(Choose a PDF|This form-based|This PDF contains|No selectable text)/.test(error.message)
      ? error.message : 'This PDF is malformed or uses unsupported content. Export a fresh text-based PDF and try again.';
  parentPort.postMessage({ error: message });
} finally { await loading?.destroy().catch(() => {}); }
