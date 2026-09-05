import { useAuthStore } from "~/stores/auth";
import { useAppToast, type ToastType } from "~/composables/useAppToast";
import { parseApiError } from "~/utils/apiError";

// Shared mutex lock for concurrent 401 refresh requests
let refreshPromise: Promise<boolean> | null = null;

export const useApi = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  // In the browser, ALWAYS enforce relative /api/v1 to route through Nuxt's internal proxy (prevents CORS on production VPS)
  const resolvedBaseUrl =
    import.meta.client &&
    typeof config.public.apiBaseUrl === "string" &&
    config.public.apiBaseUrl.startsWith("http")
      ? "/api/v1"
      : config.public.apiBaseUrl || "/api/v1";

  const api = $fetch.create({
    baseURL: resolvedBaseUrl,
    retry: 1,
    retryStatusCodes: [408, 429, 500, 502, 503, 504],
    retryDelay: 1000,

    headers: {
      Accept: "application/json",
    },

    onRequest({ options }) {
      const authSessionCookie = useCookie<{ token?: string } | null>(
        "auth-session",
      );
      const accessTokenCookie = useCookie<string | null>("access_token");
      const token =
        authStore.token ||
        authSessionCookie.value?.token ||
        accessTokenCookie.value;

      if (token) {
        options.headers = new Headers(options.headers);
        options.headers.set("Authorization", `Bearer ${token}`);
      }
    },

    async onResponseError(context) {
      const errorResult = parseApiError(context);
      const requestUrl = context.request.toString();
      const isAuthEndpoint =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/refresh") ||
        requestUrl.includes("/auth/logout");

      // Handle 401 Unauthorized with Single-Flight Refresh Mutex
      if (context.response?.status === 401 && !isAuthEndpoint) {
        const redirectPath =
          typeof window !== "undefined" ? window.location.pathname : "/home";
        if (authStore.refreshToken) {
          try {
            if (!refreshPromise) {
              refreshPromise = authStore.refreshSession().finally(() => {
                refreshPromise = null;
              });
            }

            const isRefreshed = await refreshPromise;
            if (isRefreshed) {
              return;
            } else {
              await authStore.logout(redirectPath);
            }
          } catch {
            await authStore.logout(redirectPath);
          }
        } else {
          await authStore.logout(redirectPath);
        }
      }

      if (import.meta.client) {
        try {
          const { addToast } = useAppToast();
          const toastType: ToastType =
            errorResult.severity === "error"
              ? "error"
              : errorResult.severity === "warn"
                ? "warning"
                : errorResult.severity === "info"
                  ? "info"
                  : "error";

          addToast(toastType, errorResult.detail, errorResult.summary, 4000);
        } catch (err) {
          if (import.meta.dev) {
            // eslint-disable-next-line no-console
            console.warn("[useApi] Failed to display toast:", err);
          }
        }
      }
    },
  });

  return api;
};
