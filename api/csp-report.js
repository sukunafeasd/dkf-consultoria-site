module.exports = function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).end();
  }

  const report = request.body?.['csp-report'] || request.body || {};
  let blockedOrigin = 'unknown';
  try {
    if (report['blocked-uri']) blockedOrigin = new URL(report['blocked-uri']).origin;
  } catch {
    blockedOrigin = 'invalid';
  }

  console.warn('CSP report', {
    directive: report['violated-directive'] || 'unknown',
    blockedOrigin
  });
  return response.status(204).end();
};
