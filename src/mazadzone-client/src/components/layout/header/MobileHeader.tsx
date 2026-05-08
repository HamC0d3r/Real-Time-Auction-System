import Link from "next/link";
import { Search, Gavel, Package, User, ChevronDown, LayoutDashboard, Menu, X } from "lucide-react";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "./header.constants";

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
}: MobileHeaderProps) => {
  return (
    <>
      {/* Mobile Search Toggle */}
      <div className="md:hidden flex items-center gap-2 ml-auto mr-4">
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
      {mounted && isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden absolute top-16 left-0 w-full bg-dark border-b border-white/10 shadow-2xl animate-in slide-in-from-top-4 duration-300 z-40"
        >
          <div className="px-4 py-6 space-y-8">
            {/* User Actions Section */}
            {isAuthenticated ? (
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href={ROUTES.AUCTIONS.LIST}
                  className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Gavel className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm font-medium">My Bids</span>
                </Link>
                <Link
                  href={ROUTES.ORDERS.LIST}
                  className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm font-medium">My Orders</span>
                </Link>
                {isSeller && (
                  <Link
                    href={ROUTES.SELLER.DASHBOARD}
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
