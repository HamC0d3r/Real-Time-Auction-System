import { TokenProvider } from "@/lib/api/token-provider";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./token";
import { env } from "@/config/env";

type TokenRefreshCallback = (token: string) => void;

let refreshCallbacks: TokenRefreshCallback[] = [];
let logoutRedirect: (() => void) | null = null;

function createTokenManager(): TokenProvider {
  return {
    getAccessToken,
    getRefreshToken,

    async refreshAccessToken(): Promise<string> {
      const refreshTok = getRefreshToken();
      if (!refreshTok) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken: refreshTok }),
      });

      if (!response.ok) {
        clearTokens();
        logoutRedirect?.();
        throw new Error("Token refresh failed");
      }

      const { token, refreshToken } = await response.json();
      setTokens(token, refreshToken);

      refreshCallbacks.forEach((cb) => cb(token));

      return token;
    },

    onTokenRefreshed(callback: TokenRefreshCallback) {
      refreshCallbacks.push(callback);
      return () => {
        refreshCallbacks = refreshCallbacks.filter((cb) => cb !== callback);
      };
    },

    onLogout(redirect: () => void) {
      logoutRedirect = redirect;
    },
  };
}

export const tokenManager = createTokenManager();