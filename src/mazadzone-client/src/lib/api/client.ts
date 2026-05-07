import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
} from "axios";
import type { ApiError, ApiResponse } from "@/types/api.types";
import { env } from "@/config/env";

// ─── Create Axios Instance ──────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor ────────────────────────────────────────
// Injects the Authorization header if a token exists.
// We import lazily from the auth store to avoid circular dependencies.

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Dynamic import avoids circular dependency between api client ↔ auth store
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAuthStore } = require("@/stores/auth.store") as {
      useAuthStore: { getState: () => { accessToken: string | null } };
    };

    const token = useAuthStore.getState().accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor ───────────────────────────────────────
// Normalizes error responses into a consistent ApiError shape.

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const apiError: ApiError = {
      message:
        error.response?.data?.message ??
        error.message ??
        "An unexpected error occurred",
      statusCode: error.response?.status ?? 500,
      errors: error.response?.data?.errors,
      ...(process.env.NODE_ENV === "development" && {
        originalError: error,
      }),
    };

    // TODO: Handle 401 — trigger token refresh or redirect to login
    if (apiError.statusCode === 401) {
      // Future: call token refresh logic here
    }

    return Promise.reject(apiError);
  },
);

// ─── Typed Helper Methods ───────────────────────────────────────

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<ApiResponse<T>>(url, config).then((r) => r.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<ApiResponse<T>>(url, data, config).then((r) => r.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<ApiResponse<T>>(url, data, config).then((r) => r.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<ApiResponse<T>>(url, data, config).then((r) => r.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<ApiResponse<T>>(url, config).then((r) => r.data),
};

export { apiClient };
