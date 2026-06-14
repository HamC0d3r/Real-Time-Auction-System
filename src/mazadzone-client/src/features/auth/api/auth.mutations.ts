/**
 * React Query mutations for the Auth feature.
 * Connects directly to the ASP.NET Core endpoints.
 */

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, logout, registerBidder } from "./auth.api";
import { decodeJwtToken, mapRegisterFormToRequest } from "./auth.mappers";
import { useAuthStore } from "@/stores/auth.store";
import { useAppToast } from "@/lib/toast/app-toast";
import { ROUTES } from "@/config/routes.config";
import type { LoginFormValues } from "../validations/login.schema";
import type { RegisterFormValues } from "../validations/register.schema";
import type { ApiError } from "@/types/api.types";
import { getRefreshToken } from "@/lib/auth/token";

/**
 * Mutation hook to perform login.
 * Decodes the returned JWT payload, sets the auth store, and redirects the user.
 */
export function useLoginMutation() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);
  const appToast = useAppToast();

  return useMutation({
    mutationFn: (values: LoginFormValues) =>
      login({
        email: values.email,
        password: values.password,
      }),
    onSuccess: (data) => {
      const decodedUser = decodeJwtToken(data.token);

      // Log in store and localStorage
      loginStore(decodedUser, data.token, data.refreshToken);

      const roleDisplayName =
        decodedUser.role === "admin"
          ? "Admin"
          : decodedUser.role === "seller"
          ? "Seller"
          : "Bidder";

      appToast.success("Welcome Back", `Successfully signed in as ${roleDisplayName}.`);

      // Redirect depending on user role
      if (decodedUser.role === "admin") {
        router.push(ROUTES.ADMIN.DASHBOARD);
      } else if (decodedUser.role === "seller") {
        router.push(ROUTES.SELLER.DASHBOARD);
      } else {
        router.push(ROUTES.HOME);
      }
    },
    onError: (err: ApiError) => {
      const isValidationError =
        err.message === "One or more validation errors occurred." ||
        err.statusCode === 400 ||
        err.statusCode === 401;
      const displayMessage = isValidationError
        ? "Email or password incorrect."
        : (err.message || "Invalid email or password.");
      appToast.error("Sign In Failed", displayMessage);
    },
  });
}

/**
 * Mutation hook to perform bidder registration.
 * Splits full name, creates the profile, automatically decodes token to log the user in, and redirects.
 */
export function useRegisterMutation() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);
  const appToast = useAppToast();

  return useMutation({
    mutationFn: (values: RegisterFormValues) => {
      const requestDto = mapRegisterFormToRequest(values);
      return registerBidder(requestDto);
    },
    onSuccess: (data) => {
      const decodedUser = decodeJwtToken(data.tokenInfo.token);

      // Automatically log the user in after successful registration
      loginStore(decodedUser, data.tokenInfo.token, data.tokenInfo.refreshToken);

      appToast.success("Account Created", "Your bidder profile has been registered successfully.");
      router.push(ROUTES.HOME);
    },
    onError: (err: ApiError) => {
      appToast.error("Registration Failed", err.message || "Could not register account. Please try again.");
    },
  });
}

/**
 * Mutation hook to log out.
 * Revokes refresh tokens on the backend and clears local storage/store sessions.
 */
export function useLogoutMutation() {
  const router = useRouter();
  const logoutStore = useAuthStore((state) => state.logout);
  const appToast = useAppToast();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await logout({
          refreshToken,
          isLogoutFromAllDevices: false,
        });
      }
    },
    onSettled: () => {
      // Clear store session regardless of API network errors to ensure user is logged out locally
      logoutStore();
      appToast.success("Goodbye", "You have successfully signed out.");
      router.push(ROUTES.AUTH.LOGIN);
    },
  });
}
