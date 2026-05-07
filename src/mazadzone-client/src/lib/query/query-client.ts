import { QueryClient } from "@tanstack/react-query";

/**
 * TanStack Query client configuration.
 *
 * Shared between the server-side (RSC) and client-side (QueryProvider).
 * We use a factory function to ensure each SSR request gets a fresh client,
 * while the browser reuses a singleton.
 */

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * 60 seconds stale time — prevents excessive refetching when
         * navigating between pages. Adjust per-query as needed.
         */
        staleTime: 60 * 1000,

        /**
         * 5 minutes garbage collection time (formerly cacheTime).
         * Unused queries are removed from cache after this period.
         */
        gcTime: 5 * 60 * 1000,

        /**
         * Retry failed requests up to 3 times with exponential backoff.
         * Don't retry 4xx errors — those are client mistakes.
         */
        retry: (failureCount, error) => {
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (statusCode && statusCode >= 400 && statusCode < 500) return false;
          return failureCount < 3;
        },

        /** Refetch when the browser window regains focus */
        refetchOnWindowFocus: false,
      },
      mutations: {
        /** Don't retry mutations by default */
        retry: false,
      },
    },
  });
}

// ─── Singleton for Browser ───────────────────────────────────────

let browserQueryClient: QueryClient | undefined;

/**
 * Returns the QueryClient instance.
 * On the server, always creates a new instance.
 * On the browser, reuses a singleton to preserve cache across navigations.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always create a new client
    return createQueryClient();
  }

  // Browser: reuse singleton
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}
