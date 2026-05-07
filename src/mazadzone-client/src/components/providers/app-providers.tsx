"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";

/**
 * Composes all application providers into a single wrapper.
 *
 * Order matters:
 * 1. ThemeProvider — must be outermost for CSS class toggling
 * 2. QueryProvider — data layer available to all children
 *
 * This keeps the root layout clean and makes adding/removing
 * providers a one-file change.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
