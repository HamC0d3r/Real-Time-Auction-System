/**
 * Application-level constants.
 * Centralizes branding, versioning, and default settings so they can be
 * changed in a single place without touching component code.
 */

export const APP_CONFIG = {
  name: "MazadZone",
  description: "Real-time C2C online auction platform",
  version: "0.1.0",

  /** Default number of items per paginated list */
  defaultPageSize: 12,

  /** Maximum file upload size in bytes (5 MB) */
  maxUploadSize: 5 * 1024 * 1024,

  /** Supported image MIME types for auction photos */
  supportedImageTypes: ["image/jpeg", "image/png", "image/webp"] as const,

  /** Currency used across the platform */
  currency: {
    code: "JD",
    symbol: "$",
    locale: "en-US",
  },
} as const;
