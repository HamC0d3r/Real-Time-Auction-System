import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  /** If true, removes horizontal padding (useful for full-bleed sections) */
  fullWidth?: boolean;
}

/**
 * Standard page wrapper that applies consistent max-width and padding.
 *
 * Use this inside feature page components to maintain layout consistency
 * across all pages.
 */
export function PageWrapper({
  children,
  className,
  fullWidth = false,
}: PageWrapperProps) {
  return (
    <main
      className={cn(
        "flex-1",
        !fullWidth && "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </main>
  );
}
