/**
 * Date formatting and relative time utilities.
 * Pure functions — no side effects, no external dependencies.
 */

/**
 * Formats a date string or Date object into a human-readable format.
 *
 * @example formatDate("2024-01-15T10:30:00Z") // "Jan 15, 2024"
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

/**
 * Formats a date with time.
 *
 * @example formatDateTime("2024-01-15T10:30:00Z") // "Jan 15, 2024, 10:30 AM"
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Returns a relative time string (e.g. "2 hours ago", "in 3 days").
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffSeconds) < 60) return rtf.format(diffSeconds, "second");
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute");
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  return rtf.format(diffDays, "day");
}

/**
 * Formats remaining seconds into "HH:MM:SS" or "MM:SS" countdown format.
 */
export function formatCountdown(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}
