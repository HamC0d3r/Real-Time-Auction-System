"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { getQueryClient } from "@/lib/query/query-client";

/**
 * Provides the TanStack Query client to the component tree.
 *
 * Uses the singleton pattern from getQueryClient() to ensure
 * the browser reuses the same client across navigations.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
