"use client";

import { ThemeProvider as NextThemeProvider, type ThemeProviderProps } from "next-themes";

/**
 * Theme provider wrapper around next-themes.
 * Named export per project convention (only page/layout files use default exports).
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
}
