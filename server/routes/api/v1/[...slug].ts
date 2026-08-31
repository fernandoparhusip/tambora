import { defineEventHandler, proxyRequest, setResponseHeaders, getMethod, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const origin = event.headers.get('origin') || '*';

  // 1. Always set full CORS headers on all proxy responses
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers':
      'Authorization, Content-Type, Accept, X-Requested-With, X-Request-Id, X-Device-ID, X-Device-Name, X-Browser, X-OS',
    'Access-Control-Allow-Credentials': 'true',
  });

  // 2. Intercept and satisfy OPTIONS Preflight directly (Prevent backend 401 on OPTIONS)
  if (getMethod(event) === 'OPTIONS') {
    event.node.res.statusCode = 204;
    return '';
  }

  const config = useRuntimeConfig(event);
  const target = (
    process.env.NUXT_BACKEND_URL ||
    config.backendUrl ||
    'http://88.222.242.143:9090'
  ).replace(/\/$/, '');

  const path = event.path || '';

  // 3. Strict Path Traversal & SSRF Guard
  if (!path.startsWith('/api/v1/') || path.includes('..')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid API path request',
    });
  }

  // 4. Stream request to backend
  try {
    return await proxyRequest(event, `${target}${path}`, {
      headers: {
        'x-forwarded-host': event.headers.get('host') || '',
        'x-forwarded-proto': event.headers.get('x-forwarded-proto') || 'http',
      },
    });
  } catch (err: any) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway — Layanan API Backend PLN sedang tidak dapat dihubungi.',
    });
  }
});
