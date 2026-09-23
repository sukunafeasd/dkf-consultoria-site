const allowedEvents = new Set(['kiwify_checkout', 'whatsapp_click', 'store_open', 'social_click', 'form_submit', 'lead_success']);
const requests = new Map();

const isRateLimited = (request) => {
  const forwarded = String(request.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const current = requests.get(forwarded);
  if (!current || now - current.startedAt > 60_000) {
    requests.set(forwarded, { count: 1, startedAt: now });
    return false;
  }
  current.count += 1;
  return current.count > 30;
};

module.exports = function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).end();
  }
  if (!String(request.headers['content-type'] || '').startsWith('application/json')) return response.status(415).end();
  if (Number(request.headers['content-length'] || 0) > 4096) return response.status(413).end();
  if (isRateLimited(request)) return response.status(429).end();

  const event = String(request.body?.event || '');
  if (!allowedEvents.has(event)) return response.status(400).end();

  console.log('Conversion event', {
    event,
    page: String(request.body?.page || '').slice(0, 80),
    product: String(request.body?.product || '').slice(0, 100),
    source: String(request.body?.source || '').slice(0, 120),
    campaign: String(request.body?.campaign || '').slice(0, 80)
  });
  return response.status(204).end();
};
