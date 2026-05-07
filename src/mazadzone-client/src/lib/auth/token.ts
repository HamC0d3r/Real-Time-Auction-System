/**
 * Auth token helpers for managing JWT tokens in localStorage.
 *
 * These are low-level utilities used by the auth store and API client.
 * Do NOT call these directly from components — use the auth store instead.
 */

const ACCESS_TOKEN_KEY = "mazadzone_access_token";
const REFRESH_TOKEN_KEY = "mazadzone_refresh_token";

/**
 * Retrieves the current access token from localStorage.
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Retrieves the current refresh token from localStorage.
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Persists both tokens to localStorage.
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Removes all auth tokens from localStorage.
 */
export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Checks if a JWT token is expired by decoding its payload.
 * Returns `true` if expired or if the token is malformed.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;

    const decoded = JSON.parse(atob(payload)) as { exp?: number };
    if (!decoded.exp) return true;

    // Add 30-second buffer to account for clock skew
    return Date.now() >= (decoded.exp - 30) * 1000;
  } catch {
    return true;
  }
}
