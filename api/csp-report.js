const requests = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const MAX_BODY_BYTES = 16_384;
const VALID_CONTENT_TYPES = new Set([
  'application/csp-report',
  'application/reports+json',
  'application/json'
]);

const pruneRequests = (now) => {
  for (const [key, current] of requests) {
    if (now - current.startedAt > WINDOW_MS) requests.delete(key);
  }
};

const getClientId = (request) => {
  const forwarded = String(request.headers['x-vercel-forwarded-for'] || request.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim();
  return forwarded || String(request.socket?.remoteAddress || 'unknown');
};

const isRateLimited = (request) => {
  const clientId = getClientId(request);
  const now = Date.now();
  pruneRequests(now);
  const current = requests.get(clientId);
  if (!current || now - current.startedAt > WINDOW_MS) {
    requests.set(clientId, { count: 1, startedAt: now });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS;
};

const getContentType = (request) => String(request.headers['content-type'] || '')
  .toLowerCase()
  .split(';')[0]
  .trim();

const getContentLength = (request) => {
  const length = Number.parseInt(String(request.headers['content-length'] || '0'), 10);
  return Number.isFinite(length) ? length : 0;
};

const setApiHeaders = (response) => {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('X-Content-Type-Options', 'nosniff');
};

const safeOrigin = (value) => {
  if (!value || value === 'inline' || value === 'eval') return value || 'unknown';
  try {
    return new URL(value).origin;
  } catch {
    return 'invalid';
  }
};

module.exports = function handler(request, response) {
  setApiHeaders(response);

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).end();
  }
  if (!VALID_CONTENT_TYPES.has(getContentType(request))) return response.status(415).end();
  if (getContentLength(request) > MAX_BODY_BYTES) return response.status(413).end();
  try {
    if (Buffer.byteLength(JSON.stringify(request.body ?? null), 'utf8') > MAX_BODY_BYTES) return response.status(413).end();
  } catch { return response.status(400).end(); }
  if (isRateLimited(request)) return response.status(429).end();

  const rawReport = Array.isArray(request.body) ? request.body[0]?.body || request.body[0] : request.body;
  const report = rawReport?.['csp-report'] || rawReport || {};
  const blockedOrigin = safeOrigin(report['blocked-uri'] || report.blockedURL);

  console.warn('CSP report', {
    directive: String(report['violated-directive'] || report.effectiveDirective || 'unknown')
      .replace(/[\r\n\t]/g, ' ')
      .slice(0, 80),
    blockedOrigin
  });
  return response.status(204).end();
};
