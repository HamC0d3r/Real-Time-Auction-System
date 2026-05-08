import { ROUTES } from "./routes.config";

/**
 * Navigation item shape used by Header, Sidebar, and mobile navigation.
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  /** If present, only users with one of these roles can see this item */
  roles?: ReadonlyArray<"bidder" | "seller" | "admin">;
  children?: NavItem[];
}

/**
 * Primary navigation shown in the site header.
 */
export const MAIN_NAV: NavItem[] = [
  { label: "Home", href: ROUTES.HOME },
  { label: "Auctions", href: ROUTES.AUCTIONS.LIST },
  { label: "My Orders", href: ROUTES.ORDERS.LIST, roles: ["bidder","seller"] },
];

/**
 * Seller dashboard navigation.
 */
export const SELLER_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.SELLER.DASHBOARD, roles: ["seller"] },
  { label: "My Auctions", href: ROUTES.SELLER.AUCTIONS, roles: ["seller"] },
  {
    label: "Create Auction",
    href: ROUTES.SELLER.CREATE_AUCTION,
    roles: ["seller"],
  },
];

/**
 * Admin dashboard navigation.
 */
export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, roles: ["admin"] },
  { label: "Users", href: ROUTES.ADMIN.USERS, roles: ["admin"] },
  { label: "Auctions", href: ROUTES.ADMIN.AUCTIONS, roles: ["admin"] },
  { label: "Disputes", href: ROUTES.ADMIN.DISPUTES, roles: ["admin"] },
];
