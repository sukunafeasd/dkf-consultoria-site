const allowedEvents = new Set(['kiwify_checkout', 'whatsapp_click', 'store_open']);

module.exports = function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).end();
  }

  const event = String(request.body?.event || '');
  if (!allowedEvents.has(event)) return response.status(400).end();

  console.log('Conversion event', {
    event,
    page: String(request.body?.page || '').slice(0, 80),
    product: String(request.body?.product || '').slice(0, 100)
  });
  return response.status(204).end();
};
