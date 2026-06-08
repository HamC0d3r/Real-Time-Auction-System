/**
 * Generates a RFC4122 v4 compliant UUID.
 *
 * Uses `crypto.randomUUID()` when available (secure contexts).
 * Falls back to a Math.random() based generator when running in insecure contexts
 * (e.g. accessing via IP address over HTTP on mobile devices).
 */
export function generateUUID(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  // Fallback RFC4122 v4 compliance
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
