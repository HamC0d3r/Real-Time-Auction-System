import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearTokens, setTokens, getAccessToken } from "@/lib/auth/token";
import { ROUTES } from "@/config/routes.config";
import { decodeJwtToken } from "@/features/auth/api/auth.mappers";
import { tokenManager } from "@/lib/auth/token-manager";

// --- Types -------------------------------------------------------

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

// --- Store -------------------------------------------------------

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,

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
        window.location.href = ROUTES.HOME;
      },

      setUser: (user) => set({ user }),

      setAccessToken: (token) => {
        set({ accessToken: token });
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "mazadzone-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          const storedToken = getAccessToken();
          if (storedToken !== state.accessToken) {
            setTokens(state.accessToken, "");
          }

          try {
            const decodedUser = decodeJwtToken(state.accessToken);
            if (decodedUser && decodedUser.id !== "unknown-id") {
              state.user = decodedUser;
            }
          } catch (err) {
            console.error("Failed to automatically sync user role from token on reload:", err);
          }
        }
        state?.setHydrated();
      },
    },
  ),
);

// Sync auth store accessToken and decoded user on token refresh
tokenManager.onTokenRefreshed((token) => {
  const { setAccessToken, setUser } = useAuthStore.getState();
  setAccessToken(token);
  try {
    const decodedUser = decodeJwtToken(token);
    if (decodedUser && decodedUser.id !== "unknown-id") {
      setUser(decodedUser);
    }
  } catch {
    // Silently ignore decode failures during refresh
  }
});