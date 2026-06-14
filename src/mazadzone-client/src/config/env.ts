import { z } from "zod";

/**
 * Type-safe environment variable access.
 *
 * Uses Zod to validate and parse env vars at import time so that
 * misconfiguration is caught immediately rather than at runtime.
 *
 * All public env vars MUST be prefixed with NEXT_PUBLIC_ so they are
 * available in the browser bundle.
 */

const envSchema = z.object({
  /** Base URL of the ASP.NET Core Web API (e.g. "https://api.mazadzone.com") */
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),

  /** SignalR hub base URL (e.g. "https://api.mazadzone.com/hubs") */
  NEXT_PUBLIC_SIGNALR_HUB_URL: z.string().url(),

  /** Public-facing app URL for SEO / canonical links */
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

/**
 * Validated environment variables.
 *
 * NOTE: We wrap the parse in a function and lazily evaluate so that
 * build-time SSG pages don't crash when env vars aren't set during CI.
 * Access via `env.NEXT_PUBLIC_API_BASE_URL` etc.
 */
function createEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_SIGNALR_HUB_URL: process.env.NEXT_PUBLIC_SIGNALR_HUB_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!parsed.success) {
    console.error(
      "Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );

    // In development, throw so the developer sees the problem immediately.
    // In production build, we still surface it but don't crash the entire app.
    if (process.env.NODE_ENV === "development") {
      throw new Error("Invalid environment variables");
    }
  }

  // Fallback to raw process.env values when validation fails (e.g. during build)
  const rawEnv = (parsed.data ?? {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5108",
    NEXT_PUBLIC_SIGNALR_HUB_URL: process.env.NEXT_PUBLIC_SIGNALR_HUB_URL ?? "http://localhost:5108/hubs",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  }) as z.infer<typeof envSchema>;

  // Cache for computed URLs to avoid repeated window.location reads
  let cachedApiBaseUrl: string | null = null;
  let cachedSignalrHubUrl: string | null = null;
  let cachedAppUrl: string | null = null;
  let dynamicHostname: string | null = null;
  let dynamicOrigin: string | null = null;

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      dynamicHostname = hostname;
    }
    const origin = window.location.origin;
    if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      dynamicOrigin = origin;
    }
  }

  const getDynamicUrl = (url: string) => {
    if (dynamicHostname) {
      return url.replace(/localhost|127\.0\.0\.1/g, dynamicHostname);
    }
    return url;
  };

  return {
    get NEXT_PUBLIC_API_BASE_URL() {
      if (!cachedApiBaseUrl) cachedApiBaseUrl = getDynamicUrl(rawEnv.NEXT_PUBLIC_API_BASE_URL);
      return cachedApiBaseUrl;
    },
    get NEXT_PUBLIC_SIGNALR_HUB_URL() {
      if (!cachedSignalrHubUrl) cachedSignalrHubUrl = getDynamicUrl(rawEnv.NEXT_PUBLIC_SIGNALR_HUB_URL);
      return cachedSignalrHubUrl;
    },
    get NEXT_PUBLIC_APP_URL() {
      if (!cachedAppUrl) cachedAppUrl = dynamicOrigin || rawEnv.NEXT_PUBLIC_APP_URL || rawEnv.NEXT_PUBLIC_API_BASE_URL;
      return cachedAppUrl;
    },
  };
}

export const env = createEnv();
