"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes.config";
import { useAuthStore } from "@/stores/auth.store";
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


  // States
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCategoryClick = (category: string) => {
    setIsMobileMenuOpen(false);
    const params = new URLSearchParams();
    params.set("category", category);
    router.push(`${ROUTES.AUCTIONS.LIST}?${params.toString()}`);
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
    <header className="sticky top-0 z-50 w-full bg-dark text-white shadow-md md:h-40 h-auto">
      {/* Top Row Container */}
      <div className="mx-auto flex h-16 max-w-[1408px] items-center border-b border-white/10 relative md:mt-4 md:pb-4.5 px-4 md:px-0">

        {/* Logo (Shared) */}
        <Link href={ROUTES.HOME} className="text-3xl font-bold tracking-tight flex items-center shrink-0">
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
