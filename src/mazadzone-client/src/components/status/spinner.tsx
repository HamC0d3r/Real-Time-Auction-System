import { cn } from "@/lib/utils";

interface SpinnerProps {
  /** Size in pixels */
  size?: number;
  className?: string;
}

/**
 * Minimal loading spinner.
 *
 * Uses a CSS animation for performance — no JS animation frame needed.
 */
export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("inline-flex items-center justify-center", className)}
    >
      <svg
        className="animate-spin text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width={size}
        height={size}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
