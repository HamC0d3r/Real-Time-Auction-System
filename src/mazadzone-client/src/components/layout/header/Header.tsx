"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes.config";
import { useAuthStore } from "@/stores/auth.store";
import { useAuctionFilterStore } from "@/stores/auction-filter.store";
import { DesktopHeader, DesktopBottomRow } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";

/**
 * Header
 * 
 * Main header component that manages auth state, search state, 
 * and mobile menu state. Composes DesktopHeader and MobileHeader.
 */
export function Header() {
  const router = useRouter();
  
  // Auth state
  let { isAuthenticated, user, logout } = useAuthStore();
  
  // NOTE: Hardcoded for testing by user.
  // In production, this should use user?.role and isAuthenticated from the store.
  isAuthenticated = true;
  const role = "seller"; 
  
  const { setCategory } = useAuctionFilterStore();

  // States
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCategoryClick = (category: string) => {
    setCategory(category);
    setIsMobileMenuOpen(false);
    router.push(ROUTES.AUCTIONS.LIST);
  };

  const handleSellClick = () => {
    setIsMobileMenuOpen(false);
    if (!isAuthenticated) {
      router.push(ROUTES.AUTH.LOGIN);
    } else if (role === "seller") {
      router.push(ROUTES.SELLER.CREATE_AUCTION);
    } else {
      router.push(ROUTES.PROFILE.VIEW);
    }
  };

  const isSeller = isAuthenticated && role === "seller";

  return (
    <header className="sticky top-0 z-50 w-full bg-dark text-white shadow-md">
      {/* Top Row Container */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-white/10 relative">
        
        {/* Logo (Shared) */}
        <Link href={ROUTES.HOME} className="text-2xl font-bold tracking-tight flex items-center shrink-0">
          <span className="text-white">Mazad</span>
          <span className="text-primary">Zone</span>
        </Link>

        {/* Desktop View Components */}
        <DesktopHeader 
          isAuthenticated={isAuthenticated}
          user={user}
          role={role}
          logout={logout}
          mounted={mounted}
          handleCategoryClick={handleCategoryClick}
          handleSellClick={handleSellClick}
          isSeller={isSeller}
        />

        {/* Mobile View Components */}
        <MobileHeader 
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isAuthenticated={isAuthenticated}
          isSeller={isSeller}
          mounted={mounted}
          handleCategoryClick={handleCategoryClick}
          handleSellClick={handleSellClick}
          logout={logout}
        />
      </div>

      {/* Desktop Bottom Row */}
      <DesktopBottomRow 
        mounted={mounted}
        isSeller={isSeller}
        handleCategoryClick={handleCategoryClick}
        handleSellClick={handleSellClick}
        router={router}
      />
    </header>
  );
}
