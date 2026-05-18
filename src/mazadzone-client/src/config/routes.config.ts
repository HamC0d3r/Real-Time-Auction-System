/**
 * Centralized route path constants.
 *
 * Every navigation link, redirect, and programmatic push should reference
 * these constants instead of hard-coding path strings.
 */

export const ROUTES = {
  // --- Public --------------------------------------------
  HOME: "/",

  // --- Auth (route group: (auth)) ------------------------
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
  },

  // --- Auctions ------------------------------------------
  AUCTIONS: {
    LIST: "/auctions",
    DETAIL: (id: string) => `/auctions/${id}` as const,
  },

  // --- Orders --------------------------------------------
  ORDERS: {
    LIST: "/orders",
    DETAIL: (id: string) => `/orders/${id}` as const,
  },

  // --- Bidding -------------------------------------------
  BIDDING: {
    MY_BIDS: "/bids",
  },


  // --- Seller --------------------------------------------
  SELLER: {
    DASHBOARD: "/seller",
    AUCTIONS: "/seller/auctions",
    CREATE_AUCTION: "/seller/auctions/create",
    BECOME: "/seller/become",
  },

  // --- Profile -------------------------------------------
  PROFILE: {
    VIEW: "/profile",
    EDIT: "/profile/edit",
  },

  // --- Admin ---------------------------------------------
  ADMIN: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    AUCTIONS: "/admin/auctions",
    DISPUTES: "/admin/disputes",
  },
} as const;
