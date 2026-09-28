const allowedEvents = new Set(['kiwify_checkout', 'whatsapp_click', 'store_open', 'social_click', 'form_submit', 'lead_success']);
const requests = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const MAX_BODY_BYTES = 4096;

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

const getContentLength = (request) => {
  const length = Number.parseInt(String(request.headers['content-length'] || '0'), 10);
  return Number.isFinite(length) ? length : 0;
};

const cleanField = (value, maxLength) => String(value || '')
  .replace(/[\r\n\t]/g, ' ')
  .replace(/\s{2,}/g, ' ')
  .trim()
  .slice(0, maxLength);

const setApiHeaders = (response) => {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('X-Content-Type-Options', 'nosniff');
};

const isJsonRequest = (request) => String(request.headers['content-type'] || '')
  .toLowerCase()
  .split(';')[0]
  .trim() === 'application/json';

module.exports = function handler(request, response) {
  setApiHeaders(response);

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).end();
  }
  if (!isJsonRequest(request)) return response.status(415).end();
  if (getContentLength(request) > MAX_BODY_BYTES) return response.status(413).end();
  if (isRateLimited(request)) return response.status(429).end();

  const event = String(request.body?.event || '');
  if (!allowedEvents.has(event)) return response.status(400).end();
  const page = cleanField(request.body?.page, 80);
  if (page && !page.startsWith('/')) return response.status(400).end();

  console.log('Conversion event', {
    event,
    page,
    product: cleanField(request.body?.product, 100),
    source: cleanField(request.body?.source, 120),
    campaign: cleanField(request.body?.campaign, 80)
  });
  return response.status(204).end();
};
