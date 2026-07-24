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
    DASHBOARD: "/seller/auctions",
    AUCTIONS: "/seller/auctions",
    CREATE_AUCTION: "/seller/auctions/create",
    EDIT_AUCTION: (id: string) => `/seller/auctions/${id}/edit` as const,
    BECOME: "/seller/become",
    PROFILE: (id: string) => `/users/${id}` as const,
  },

  // --- Profile -------------------------------------------
  PROFILE: {
    VIEW: "/profile",
    EDIT: "/profile/edit",
    PUBLIC: (id: string) => `/users/${id}` as const,
  },

  // --- Admin ---------------------------------------------
  ADMIN: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    AUCTIONS: "/admin/auctions",
    DISPUTES: "/admin/disputes",
    CATEGORIES: "/admin/categories",
    ACCESS: "/admin/access",
    SEED_DATA: "/admin/developer/seed-data",
  },
} as const;
