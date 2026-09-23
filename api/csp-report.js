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
  return current.count > 20;
};

module.exports = function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).end();
  }
  const contentType = String(request.headers['content-type'] || '');
  if (!contentType.startsWith('application/csp-report') && !contentType.startsWith('application/reports+json') && !contentType.startsWith('application/json')) return response.status(415).end();
  if (Number(request.headers['content-length'] || 0) > 16_384) return response.status(413).end();
  if (isRateLimited(request)) return response.status(429).end();

  const rawReport = Array.isArray(request.body) ? request.body[0]?.body || request.body[0] : request.body;
  const report = rawReport?.['csp-report'] || rawReport || {};
  let blockedOrigin = 'unknown';
  try {
    const blockedUrl = report['blocked-uri'] || report.blockedURL;
    if (blockedUrl) blockedOrigin = new URL(blockedUrl).origin;
  } catch {
    blockedOrigin = 'invalid';
  }

  console.warn('CSP report', {
    directive: report['violated-directive'] || report.effectiveDirective || 'unknown',
    blockedOrigin
  });
  return response.status(204).end();
};
