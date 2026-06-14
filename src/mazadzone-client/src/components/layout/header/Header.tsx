"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/config/routes.config";
import { useAuthStore } from "@/stores/auth.store";
import { DesktopHeader, DesktopBottomRow } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";
import { useGetUnreadCount } from "@/features/notifications";
import { useNotificationStore } from "@/features/notifications/store/notification.store";
import { useGetProfile } from "@/features/profile";

/**
 * Header
 * 
 * Main header component that manages auth state, search state, 
 * and mobile menu state. Composes DesktopHeader and MobileHeader.
 */
export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // Auth state
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = user?.role;
  const userId = user?.id;

  // States
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Fetch unread count once at the Header level (shared by DesktopHeader and MobileHeader)
  const { data: serverUnreadCount } = useGetUnreadCount(userId || "", {
    enabled: isAuthenticated,
  });

  // Fetch user profile to display the real name (first and last name) in the header profile dropdown
  const { data: profile } = useGetProfile({
    enabled: isAuthenticated,
  });
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const consumeOptimistic = useNotificationStore((state) => state._consumeOptimistic);

  // Hydrate the Zustand badge from server data
  useEffect(() => {
    if (serverUnreadCount !== undefined) {
      const wasOptimistic = consumeOptimistic();
      if (!wasOptimistic) {
        setUnreadCount(serverUnreadCount);
      }
    }
  }, [serverUnreadCount, setUnreadCount, consumeOptimistic]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
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
      return;
    }

    if (role === "seller") {
      router.push(ROUTES.SELLER.CREATE_AUCTION);
    } else {
      router.push(ROUTES.SELLER.BECOME);
    }
  };

  const isSeller = isAuthenticated && role === "seller";

  return (
    <header className="sticky top-0 z-50 w-full bg-dark text-white shadow-md md:h-40 h-auto">
      {/* Top Row Container */}
      <div className="mx-auto flex h-16 max-w-[1408px] items-center justify-between border-b border-white/10 relative md:mt-4 md:pb-4.5 px-4 md:px-0">

        {/* Logo (Shared) */}
        <Link href={ROUTES.HOME} className="text-2xl xs:text-3xl font-bold tracking-tight flex items-center shrink-0">
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
          pathname={pathname}
          unreadCount={unreadCount}
          profile={profile}
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
          pathname={pathname}
          unreadCount={unreadCount}
          user={user}
          profile={profile}
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
