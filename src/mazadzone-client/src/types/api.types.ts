/**
 * Generic API response wrappers.
 *
 * These types mirror the standard envelope shapes returned by the
 * ASP.NET Core Web API. Keep them in sync with the backend contracts.
 */

// ─── Success Response ────────────────────────────────────────────

/** Standard success wrapper returned by most API endpoints */
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

// ─── Pagination ──────────────────────────────────────────────────

/** Parameters sent to the API for paginated list requests */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}

export type SortDirection = "asc" | "desc";

/** Paginated list response from the API */
export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─── Errors ──────────────────────────────────────────────────────

/** Normalized error shape produced by the API client interceptor */
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  /** Original error for debugging — only populated in development */
  originalError?: unknown;
}

// ─── Utility Types ───────────────────────────────────────────────

/** A type that represents either a successful response or an error */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

/** Extract the data type from an ApiResponse */
export type ExtractApiData<T> = T extends ApiResponse<infer D> ? D : never;
