/**
 * Pure mapping functions for the Auth feature.
 * Decouples raw backend DTO models from presentation ViewModels and session state.
 */

import type { AuthUser, UserRole } from "@/stores/auth.store";
import type { RegisterFormValues } from "../validations/register.schema";
import type { RegisterBidderRequest } from "./auth.contracts";

/**
 * Splits a full name string into separate first, second, third, and last names
 * required by the backend bidder registration schema.
 */
export function mapRegisterFormToRequest(
  form: RegisterFormValues,
): RegisterBidderRequest {
  const names = form.fullName.trim().split(/\s+/);
  const firstName = names[0] || "";
  const secondName = names[1] || "";
  const thirdName = names[2] || "";
  // All remaining names are grouped into the lastName slot
  const lastName = names.slice(3).join(" ") || "";

  const { city, street, building, landmark } = form;

  if (!form.nationalCardFile) {
    throw new Error("National card file is required");
  }

  return {
    email: form.email,
    password: form.password,
    phoneNumber: form.phoneNumber,
    nationalId: form.nationalId,
    firstName,
    secondName,
    thirdName,
    lastName,
    city,
    street,
    building,
    landmark,
    file: form.nationalCardFile,
  };
}

/**
 * Safely decodes a Base64URL encoded string to a UTF-8 string.
 * Handles unpadded strings and correctly maps Unicode characters.
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) {
    base64 += "=".repeat(4 - pad);
  }
  return decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

/**
 * Parses a JWT token payload to extract standard claims for the user's active session.
 */
export function decodeJwtToken(token: string): AuthUser {
  try {
    const payload = token.split(".")[1];
    if (!payload) throw new Error("Invalid JWT token structure");

    const decoded = JSON.parse(base64UrlDecode(payload)) as Record<string, unknown>;

    // Standard Claim URIs
    const microsoftRoleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
    const microsoftNameClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
    const microsoftIdClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

    // 1. Extract Role (can be a string or array of strings under role/roles/claim URI)
    const rawRole = decoded.role ?? decoded.roles ?? decoded[microsoftRoleClaim];
    let finalRole: UserRole = "bidder";

    if (rawRole) {
      if (Array.isArray(rawRole)) {
        const rolesLower = (rawRole as string[]).map((r: string) => r.toLowerCase());
        if (rolesLower.includes("admin")) {
          finalRole = "admin";
        } else if (rolesLower.includes("seller")) {
          finalRole = "seller";
        } else if (rolesLower.includes("bidder")) {
          finalRole = "bidder";
        }
      } else if (typeof rawRole === "string") {
        const roleLower = rawRole.toLowerCase();
        if (roleLower.includes("admin")) {
          finalRole = "admin";
        } else if (roleLower.includes("seller")) {
          finalRole = "seller";
        } else {
          finalRole = "bidder";
        }
      }
    }

    // 2. Extract Full Name
    const fullName = String(decoded.name ?? decoded[microsoftNameClaim] ?? decoded.fullName ?? "User");

    // 3. Extract User ID
    const id = String(decoded.sub ?? decoded[microsoftIdClaim] ?? decoded.id ?? "unknown-id");

    return {
      id,
      email: String(decoded.email ?? decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ?? ""),
      fullName,
      role: finalRole,
    };
  } catch (error) {
    console.error("Failed to decode JWT token payload safely:", error);
    return {
      id: "unknown-id",
      email: "",
      fullName: "User",
      role: "bidder",
    };
  }
}
