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

  // Dynamically replace localhost/127.0.0.1 with the actual hostname of the client browser
  // to support accessing the site from other devices (e.g. mobile) on the local network.
  const getDynamicUrl = (url: string) => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
        return url.replace(/localhost|127\.0\.0\.1/g, hostname);
      }
    }
    return url;
  };

  return {
    get NEXT_PUBLIC_API_BASE_URL() {
      return getDynamicUrl(rawEnv.NEXT_PUBLIC_API_BASE_URL);
    },
    get NEXT_PUBLIC_SIGNALR_HUB_URL() {
      return getDynamicUrl(rawEnv.NEXT_PUBLIC_SIGNALR_HUB_URL);
    },
    get NEXT_PUBLIC_APP_URL() {
      if (typeof window !== "undefined") {
        const origin = window.location.origin;
        if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
          return origin;
        }
      }
      return rawEnv.NEXT_PUBLIC_APP_URL;
    },
  };
}

export const env = createEnv();
