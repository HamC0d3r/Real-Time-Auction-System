import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearTokens, setTokens, getAccessToken } from "@/lib/auth/token";

// ─── Types ───────────────────────────────────────────────────────

export type UserRole = "bidder" | "seller" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setAccessToken: (token: string) => void;
  setHydrated: () => void;
}

type AuthStore = AuthState & AuthActions;

// ─── Store ───────────────────────────────────────────────────────

/**
 * Global auth store.
 *
 * Persisted to localStorage so the user stays logged in across
 * page refreshes. The `accessToken` is also stored in localStorage
 * via the token helpers for the API client interceptor.
 *
 * The `isHydrated` flag prevents flash-of-unauthenticated-content
 * by letting components wait until localStorage has been read.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // ── State ──
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,

      // ── Actions ──
      login: (user, accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
        set({
          user,
          accessToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        clearTokens();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => set({ user }),

      setAccessToken: (token) => {
        set({ accessToken: token });
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "mazadzone-auth",
      /**
       * Only persist user data and auth state — the access token
       * is managed separately via lib/auth/token.ts helpers.
       */
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync the persisted token with the token helpers
        if (state?.accessToken) {
          const storedToken = getAccessToken();
          if (storedToken !== state.accessToken) {
            setTokens(state.accessToken, "");
          }
        }
        state?.setHydrated();
      },
    },
  ),
);
