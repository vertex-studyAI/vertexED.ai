import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { checkRateLimit } from '../_lib/rateLimit.js';
import { decodePdfRequest, extractPdf, PdfImportError } from '../_lib/pdfImport.js';

export function createPdfImportHandler({ verifyUser = verifyAuthUser, rateLimit = checkRateLimit, extract = extractPdf } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST to import a PDF.' });
    if (rejectOversizedJsonBody(req, res, 1_400_000)) return;
    const user = await verifyUser(req, res);
    if (!user) return;
    const rate = await rateLimit(`${user.id}:pdf-import`, 6, 60_000);
    if (!rate.allowed) return res.status(rate.configurationError ? 503 : 429).json({ error: 'PDF import is temporarily unavailable. Try again shortly.' });
    const controller = new AbortController();
    const abort = () => controller.abort();
    req.once?.('aborted', abort); res.once?.('close', abort);
    try {
      const bytes = decodePdfRequest(readJsonBody(req));
      const result = await extract(bytes, { signal: controller.signal });
      if (!controller.signal.aborted) return res.status(200).json(result);
    } catch (error) {
      if (!controller.signal.aborted) return res.status(error instanceof PdfImportError ? error.status : 503).json({
        error: error instanceof PdfImportError ? error.message : 'PDF import is unavailable. Your existing sources are unchanged.',
      });
    } finally { req.removeListener?.('aborted', abort); res.removeListener?.('close', abort); }
  };
}
export default createPdfImportHandler();
