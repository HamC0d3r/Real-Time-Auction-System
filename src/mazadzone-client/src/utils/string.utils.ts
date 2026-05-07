/**
 * String manipulation utilities.
 * Pure functions — no side effects, no external dependencies.
 */

/**
 * Truncates a string to the given max length, appending "…" if truncated.
 *
 * @example truncate("Hello world", 5) // "Hello…"
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}

/**
 * Converts a string to a URL-friendly slug.
 *
 * @example slugify("Hello World! (2024)") // "hello-world-2024"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word characters
    .replace(/[\s_]+/g, "-") // replace spaces and underscores with hyphens
    .replace(/-+/g, "-") // collapse consecutive hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}

/**
 * Capitalizes the first letter of a string.
 *
 * @example capitalize("hello world") // "Hello world"
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generates initials from a full name (max 2 characters).
 *
 * @example getInitials("John Doe") // "JD"
 * @example getInitials("Jane") // "JA"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return (parts[0]?.[0] ?? "").toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
}
