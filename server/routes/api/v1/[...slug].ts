import { defineEventHandler, proxyRequest } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const target = (
    process.env.NUXT_BACKEND_URL ||
    config.backendUrl ||
    'http://88.222.242.143:9090'
  ).replace(/\/$/, '');

  const path = event.path || '';
  return proxyRequest(event, `${target}${path}`);
});
