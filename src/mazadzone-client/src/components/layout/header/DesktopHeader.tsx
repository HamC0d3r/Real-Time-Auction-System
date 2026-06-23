"use client";

import Link from "next/link";
import { useState, useRef, useMemo } from "react";
import { Gavel, Package, ChevronDown, LayoutDashboard, Plus } from "lucide-react";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORIES } from "./header.constants";
import type { AuthUser } from "@/stores/auth.store";
import { NotificationPopover } from "@/features/notifications";
import type { UserProfile } from "@/features/profile";
import { GlobalHeaderSearch } from "./GlobalHeaderSearch";
import { ModeToggle } from "@/components/layout/mode-toggle";

export interface DesktopHeaderProps {
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: string | undefined;
  logout: () => void;
  mounted: boolean;
  pathname: string;
  unreadCount: number;
  profile?: UserProfile;
}

export const DesktopHeader = ({
  isAuthenticated,
  user,
  logout,
  mounted,
  pathname,
  unreadCount,
  profile,
}: DesktopHeaderProps) => {
  const displayName = useMemo(() => {
    const nameToUse = profile?.fullName || user?.fullName || "User";
    if (!nameToUse) return "User";
    const parts = nameToUse.trim().split(/\s+/);
    if (parts.length === 0 || (parts.length === 1 && !parts[0])) return "User";
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]}`;
  }, [profile?.fullName, user?.fullName]);
  const displayEmail = profile?.email || user?.email || "";

  return (
    <>
      {/* Desktop Search Bar (Part of Top Row) */}
      <GlobalHeaderSearch
        isAdmin={false}
        placeholder="Search..."
        containerClassName="hidden md:flex flex-1 max-w-xl ml-5 mr-7 relative mx-0 pr-0"
        inputClassName="w-full bg-white text-black text-2xl pl-5 rounded-2xl h-13 border-none focus-visible:ring-2 focus-visible:ring-primary"
        iconClassName="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 cursor-pointer"
        iconPosition="right"
      />

      {/* Right Nav (Desktop) */}
      <div className="hidden md:flex items-center gap-6">
        <ModeToggle />

        <div
          className={cn(
            "flex items-center gap-6",
            !mounted && "invisible pointer-events-none select-none",
          )}
          aria-hidden={!mounted}
        >
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href={ROUTES.AUTH.LOGIN} className="text-lg font-medium hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link href={ROUTES.AUTH.REGISTER} className="text-lg font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                Sign Up
              </Link>
            </div>
          ) : (
            <>
              <Link href={ROUTES.BIDDING.MY_BIDS} className={cn("hidden lg:flex items-center gap-2 text-xl font-medium transition-colors hover:text-primary", pathname === ROUTES.BIDDING.MY_BIDS ? "text-primary" : "")}>
                <Gavel className="h-7 w-7" />
                My Bids
              </Link>

              <Link href={ROUTES.ORDERS.LIST} className={cn("hidden lg:flex items-center gap-2 text-xl font-medium transition-colors hover:text-primary", pathname === ROUTES.ORDERS.LIST ? "text-primary" : "")}>
                <Package className="h-7 w-7" />
                My Orders
              </Link>

              <NotificationPopover unreadCount={unreadCount} />

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-90 transition-opacity outline-none cursor-pointer">
                  <div className="size-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm select-none border border-primary-foreground/20 shrink-0">
                    {displayName
                      ? displayName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "U"}
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white text-black border-none rounded-xl shadow-lg p-1">
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 rounded-lg focus:outline-none transition-colors p-2.5">
                    <Link href={ROUTES.PROFILE.PUBLIC(user?.id || "")} className="flex flex-col items-start w-full group">
                      <span className="text-sm font-bold leading-none text-gray-900 group-hover:text-primary group-focus:text-primary transition-colors">{displayName}</span>
                      <span className="text-xs mt-1.5 leading-none text-gray-500 truncate">{displayEmail}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem asChild className="cursor-pointer font-medium text-sm flex items-center py-2 px-3 rounded-lg focus:bg-primary focus:text-white focus:outline-none transition-colors">
                    <Link href={ROUTES.PROFILE.VIEW}>Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 font-medium text-sm flex items-center py-2 px-3 rounded-lg focus:bg-primary focus:text-white focus:outline-none transition-colors">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

    </>
  );
};

const SUBCATEGORIES_BY_CATEGORY: Record<string, string[]> = {
  "Tech and Electronics": ["Laptops", "Smartphones", "Cameras", "Others"],
  "Fashion and Style": ["Watches", "Shoes", "Accessories", "Others"],
  "Home and Living": ["Furniture", "Decor", "Others"],
  "Collectibles and Art": ["Paintings", "Antiques", "Sculptures", "Others"],
  "Hobbies and Leisure": ["Books", "Musical Instruments", "Sports Equipment", "Others"],
  "Motors": ["Cars", "Motorcycles", "Others"],
};

export const DesktopBottomRow = ({
  mounted,
  isSeller,
  handleCategoryClick,
  handleSellClick,
  router, // We might need router for the dashboard button
  show = true,
}: {
  mounted: boolean;
  isSeller: boolean;
  handleCategoryClick: (category: string) => void;
  handleSellClick: () => void;
  router: { push: (path: string) => void };
  show?: boolean;
}) => {
  const [activeHoverCategory, setActiveHoverCategory] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (category: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveHoverCategory(category);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveHoverCategory(null);
    }, 150); // Small delay to allow moving mouse to the submenu
  };

  const handleSubMenuMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleSubMenuMouseLeave = () => {
    setActiveHoverCategory(null);
  };

  const handleSubcategoryClick = (category: string, subcategory: string) => {
    setActiveHoverCategory(null);
    const params = new URLSearchParams();
    params.set("category", category);
    params.set("subcategory", subcategory);
    router.push(`${ROUTES.AUCTIONS.LIST}?${params.toString()}`);
  };

  return (
    <div className={cn(
      "hidden md:flex mx-auto max-w-[1408px] items-center justify-between px-4 md:px-0 relative transition-[height,opacity,transform,padding] duration-300 ease-in-out origin-top overflow-hidden",
      show
        ? "h-14 opacity-100 transform translate-y-0 pt-4"
        : "h-0 opacity-0 transform -translate-y-2 pt-0 pointer-events-none"
    )}>
      <nav className="flex items-center gap-6 whitespace-nowrap overflow-x-auto no-scrollbar pt-1.5 h-full">
        {CATEGORIES.map((category) => {
          const isCategoryHovered = activeHoverCategory === category;
          return (
            <button
              key={category}
              onMouseEnter={() => handleMouseEnter(category)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleCategoryClick(category)}
              className={cn(
                "text-lg font-normal text-primary-foreground hover:text-primary transition-colors cursor-pointer relative pb-3 h-full flex items-center",
                isCategoryHovered && "text-primary"
              )}
            >
              {category}
              {isCategoryHovered && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in zoom-in-95 duration-150" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Horizontal Subcategories Dropdown Bar */}
      <div
        onMouseEnter={handleSubMenuMouseEnter}
        onMouseLeave={handleSubMenuMouseLeave}
        className={cn(
          "absolute left-0 right-0 z-40 transition-all duration-200 ease-in-out shadow-lg rounded-b-2xl border border-t-0 border-background/10 bg-foreground overflow-hidden px-6",
          activeHoverCategory
            ? "h-14 opacity-100 visible pointer-events-auto"
            : "h-0 opacity-0 invisible pointer-events-none"
        )}
        style={{ top: "100%" }}
      >
        <div className="h-full flex items-center">
          <div className="flex items-center gap-5 whitespace-nowrap py-2 w-full">
            <span className="text-background/60 text-xs uppercase tracking-wider font-extrabold mr-2 select-none">
              Subcategories:
            </span>
            {activeHoverCategory &&
              SUBCATEGORIES_BY_CATEGORY[activeHoverCategory]?.map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleSubcategoryClick(activeHoverCategory, sub)}
                  className="text-sm font-semibold text-background/95 hover:text-primary hover:bg-background/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {sub}
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-9 shrink-0 ml-6 pb-2.5">
        {mounted && isSeller && (
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.SELLER.AUCTIONS)}
            className="bg-transparent border-white/20 text-white  text-lg hover:bg-primary/20 hover:text-primary hover:border-primary gap-2 h-12 rounded-xl"
          >
            <LayoutDashboard className="h-5 w-5" />
            Seller Dashboard
          </Button>
        )}

        <Button
          onClick={handleSellClick}
          className="bg-primary hover:bg-primary/90 text-white font-medium px-5 h-12 rounded-xl shadow-md text-lg flex items-center gap-1.5"
        >
          <Plus className="h-5 w-5 shrink-0" />
          <span>Sell</span>
        </Button>
      </div>
    </div>
  );
};
