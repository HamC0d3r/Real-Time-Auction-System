"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Search, Gavel, Package, User, ChevronDown, LayoutDashboard, Menu, X } from "lucide-react";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "./header.constants";
import { NotificationPopover } from "@/features/notifications";
import type { AuthUser } from "@/stores/auth.store";
import type { UserProfile } from "@/features/profile";

export interface MobileHeaderProps {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  isSeller: boolean;
  mounted: boolean;
  handleCategoryClick: (category: string) => void;
  handleSellClick: () => void;
  logout: () => void;
  pathname: string;
  unreadCount: number;
  user: AuthUser | null;
  profile?: UserProfile;
}

export const MobileHeader = ({
  isSearchOpen,
  setIsSearchOpen,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isAuthenticated,
  isSeller,
  mounted,
  handleCategoryClick,
  handleSellClick,
  logout,
  pathname,
  unreadCount,
  user,
  profile,
}: MobileHeaderProps) => {

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
      {/* Mobile Search Toggle */}
      <div className="md:hidden flex items-center gap-2 ml-auto mr-4">
        {isAuthenticated && (
          <div
            className={cn(!mounted && "invisible pointer-events-none select-none")}
            aria-hidden={!mounted}
          >
            <NotificationPopover unreadCount={unreadCount} className="mr-2" />
          </div>
        )}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="p-2 hover:text-primary transition-colors"
          aria-label="Toggle search"
          aria-expanded={isSearchOpen}
        >
          <Search className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Search Input Overlay */}
      {isSearchOpen && (
        <div className="absolute inset-0 bg-dark z-50 flex items-center px-4 md:hidden animate-in fade-in slide-in-from-top-2">
          <Input
            autoFocus
            className="w-full bg-white text-black pl-4 pr-10 rounded-md h-10"
            placeholder="Search..."
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="ml-2 p-2"
            aria-label="Close search"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Hamburger Menu Icon */}
      <button
        className="md:hidden p-2 hover:text-primary transition-colors"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu"
      >
        {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className={cn(
            "md:hidden absolute top-16 left-0 w-full bg-dark border-b border-white/10 shadow-2xl animate-in slide-in-from-top-4 duration-300 z-40",
            !mounted && "invisible pointer-events-none select-none",
          )}
          aria-hidden={!mounted}
        >
          <div className="px-4 py-6 space-y-8">
            {/* User Profile Banner */}
            {isAuthenticated && (
              <Link
                href={ROUTES.PROFILE.PUBLIC(user?.id || "")}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors w-full text-left"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm select-none border border-white/10 shrink-0">
                  {displayName
                    ? displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "U"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white truncate leading-none">{displayName}</span>
                  <span className="text-[11px] text-gray-400 truncate mt-1.5 leading-none">{displayEmail}</span>
                </div>
              </Link>
            )}

            {/* User Actions Section */}
            {isAuthenticated ? (
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href={ROUTES.BIDDING.MY_BIDS}
                  className={cn("flex flex-col items-center justify-center p-4 rounded-xl transition-colors", pathname === ROUTES.BIDDING.MY_BIDS ? "bg-white/10 text-primary" : "bg-white/5 hover:bg-white/10 text-white")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Gavel className={cn("h-6 w-6 mb-2", pathname === ROUTES.BIDDING.MY_BIDS ? "text-primary" : "text-gray-400")} />
                  <span className="text-sm font-medium">My Bids</span>
                </Link>
                <Link
                  href={ROUTES.ORDERS.LIST}
                  className={cn("flex flex-col items-center justify-center p-4 rounded-xl transition-colors", pathname === ROUTES.ORDERS.LIST ? "bg-white/10 text-primary" : "bg-white/5 hover:bg-white/10 text-white")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package className={cn("h-6 w-6 mb-2", pathname === ROUTES.ORDERS.LIST ? "text-primary" : "text-gray-400")} />
                  <span className="text-sm font-medium">My Orders</span>
                </Link>
                {isSeller && (
                  <Link
                    href={ROUTES.SELLER.AUCTIONS}
                    className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-6 w-6 text-primary mb-2" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={handleSellClick}
                  className="flex flex-col items-center justify-center p-4 bg-primary rounded-xl hover:bg-primary/90 transition-colors"
                >
                  <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center mb-2">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                  <span className="text-sm font-bold">Sell Now</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button asChild className="flex-1 bg-primary h-12">
                  <Link href={ROUTES.AUTH.LOGIN}>Sign In</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 h-12 border-white/20">
                  <Link href={ROUTES.AUTH.REGISTER}>Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Categories Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Categories</h3>
              <div className="grid grid-cols-1 gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <span className="text-[15px] font-medium text-gray-200">{category}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500 -rotate-90" />
                  </button>
                ))}
              </div>
            </div>

            {/* Account Management */}
            {isAuthenticated && (
              <div className="pt-4 border-t border-white/5 flex items-center justify-between px-1">
                <Link
                  href={ROUTES.PROFILE.VIEW}
                  className="flex items-center gap-2 text-gray-400 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm">Account Settings</span>
                </Link>
                <button onClick={logout} className="text-sm font-bold text-red-500">Sign Out</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
