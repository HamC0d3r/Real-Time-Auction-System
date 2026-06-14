import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
} from "axios";
import type { ApiError, ApiResponse, HttpValidationProblemDetails } from "@/types/api.types";
import { env } from "@/config/env";
import { tokenManager } from "@/lib/auth/token-manager";
import { isTokenExpired } from "@/lib/auth/token";

// --- Create Axios Instance ---------------------------------------

const apiClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// --- Token Refresh Helper ----------------------------------------

let refreshPromise: Promise<string> | null = null;

async function handleTokenRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      return await tokenManager.refreshAccessToken();
    } catch (error) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// --- Request Interceptor -----------------------------------------

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = tokenManager.getAccessToken() ?? null;

    const isExcluded =
      config.url &&
      (config.url.endsWith("/api/v1/bidders/register") ||
        config.url.endsWith("/api/v1/auth/login") ||
        config.url.endsWith("/api/v1/auth/refresh"));

    if (token && !isExcluded) {
      if (isTokenExpired(token)) {
        try {
          token = await handleTokenRefresh();
        } catch (error) {
          return Promise.reject(error);
        }
      }

      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// --- Response Interceptor ----------------------------------------

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<HttpValidationProblemDetails>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const statusCode = error.response?.status ?? 500;

    const isExcluded =
      originalRequest?.url &&
      (originalRequest.url.endsWith("/api/v1/bidders/register") ||
        originalRequest.url.endsWith("/api/v1/auth/login") ||
        originalRequest.url.endsWith("/api/v1/auth/refresh"));

    if (statusCode === 401 && originalRequest && !originalRequest._retry && !isExcluded) {
      if (tokenManager.getRefreshToken()) {
        originalRequest._retry = true;
        try {
          const newToken = await handleTokenRefresh();
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
    }

    const data = error.response?.data;
    const isServerError = statusCode >= 500;
    const apiError: ApiError = {
      message:
        (isServerError
          ? data?.title
          : data?.detail ?? data?.title) ??
        error.message ??
        "An unexpected error occurred",
      statusCode,
      errors: data?.errors,
      ...(process.env.NODE_ENV === "development" && {
        originalError: error,
      }),
    };

    return Promise.reject(apiError);
  },
);

// --- URL Formatting Helper ---------------------------------------

const formatUrl = (url: string): string => {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/api/v1")) {
    return url;
  }
  if (url.startsWith("api/v1")) {
    return `/${url}`;
  }
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  return `/api/v1/${cleanUrl}`;
};

// --- Typed Helper Methods -----------------------------------------

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.get<T>(formatUrl(url), config).then((r) => ({
      data: r.data,
      success: true,
      message: "",
      timestamp: new Date().toISOString(),
    })),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.post<T>(formatUrl(url), data, config).then((r) => ({
      data: r.data,
      success: true,
      message: "",
      timestamp: new Date().toISOString(),
    })),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.put<T>(formatUrl(url), data, config).then((r) => ({
      data: r.data,
      success: true,
      message: "",
      timestamp: new Date().toISOString(),
    })),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.patch<T>(formatUrl(url), data, config).then((r) => ({
      data: r.data,
      success: true,
      message: "",
      timestamp: new Date().toISOString(),
    })),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.delete<T>(formatUrl(url), config).then((r) => ({
      data: r.data,
      success: true,
      message: "",
      timestamp: new Date().toISOString(),
    })),
};

export { apiClient };