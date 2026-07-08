export function createMocks({
  method = 'POST',
  headers = {},
  body = {},
} = {}) {
  let statusCode = 200;
  let jsonBody = null;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      jsonBody = data;
      return res;
    },
  };

  const req = {
    method,
    headers,
    body,
    socket: { remoteAddress: '127.0.0.1' },
  };

  return {
    req,
    res,
    getStatus: () => statusCode,
    getJson: () => jsonBody,
  };
}
