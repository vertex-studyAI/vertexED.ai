import handler from '../[[...path]].js';

/** Connect supplies a URL relative to /api. Preserve the original request stream
 * so local development uses production CORS, limits, parsing and error handling.
 */
export async function nodeApiMiddleware(req, res) {
  const url = new URL(req.url || '/', 'http://localhost');
  req.query = { ...Object.fromEntries(url.searchParams), path: url.pathname.split('/').filter(Boolean) };
  const response = {
    status(code) { res.statusCode = code; return response; },
    json(body) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); return response; },
    setHeader: (key, value) => res.setHeader(key, value),
    end: body => res.end(body),
    get headersSent() { return res.headersSent; },
    get writableEnded() { return res.writableEnded; },
  };
  await handler(req, response);
}
