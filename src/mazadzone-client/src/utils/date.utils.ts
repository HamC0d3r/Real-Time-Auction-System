import { format, formatDistanceToNowStrict } from "date-fns";

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
  formatString: string = "MMM d, yyyy",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, formatString);
}

/**
 * Formats a date with time.
 *
 * @example formatDateTime("2024-01-15T10:30:00Z") // "Jan 15, 2024, 10:30 AM"
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy, h:mm a");
}

/**
 * Returns a relative time string (e.g. "2 hours ago", "in 3 days").
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNowStrict(d, { addSuffix: true });
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

/**
 * Safely parses an API date string as UTC if it doesn't specify a timezone offset.
 * Prevents local timezone distortion of server UTC timestamps.
 */
export function parseUtcDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  if (!dateStr) return new Date();
  
  if (typeof dateStr === "string") {
    // If the date string does not specify timezone information (no Z and no offset),
    // append 'Z' so it gets parsed correctly as a UTC datetime and converted to local time.
    if (!dateStr.includes("Z") && !dateStr.match(/[-+]\d{2}:\d{2}$/)) {
      return new Date(`${dateStr}Z`);
    }
    return new Date(dateStr);
  }
  return new Date(dateStr);
}
