import Link from "next/link";
import { Search, Gavel, Package, Bell, User, ChevronDown, LayoutDashboard } from "lucide-react";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORIES } from "./header.constants";
import type { AuthUser } from "@/stores/auth.store";

export interface DesktopHeaderProps {
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: string | undefined;
  logout: () => void;
  mounted: boolean;
  handleCategoryClick: (category: string) => void;
  handleSellClick: () => void;
  isSeller: boolean;
}

export const DesktopHeader = ({
  isAuthenticated,
  logout,
  mounted,
  handleCategoryClick,
  handleSellClick,
  isSeller,
}: DesktopHeaderProps) => {
  return (
    <>
      {/* Desktop Search Bar (Part of Top Row) */}
      <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
        <Input
          className="w-full bg-white text-black pl-4 pr-10 rounded-md h-10 border-none focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Search..."
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      {/* Right Nav (Desktop) */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center text-sm font-medium text-gray-300">
          <span className="cursor-pointer hover:text-white transition-colors">AR</span>
          <span className="mx-2 text-gray-500">|</span>
          <span className="cursor-pointer text-primary">EN</span>
        </div>

        {mounted && (
          <div className="flex items-center gap-6">
            {!isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href={ROUTES.AUTH.LOGIN} className="text-sm font-medium hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link href={ROUTES.AUTH.REGISTER} className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Sign Up
                </Link>
              </div>
            ) : (
              <>
                <Link href={ROUTES.AUCTIONS.LIST} className="hidden lg:flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                  <Gavel className="h-4 w-4" />
                  My Bids
                </Link>

                <Link href={ROUTES.ORDERS.LIST} className="hidden lg:flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                  <Package className="h-4 w-4" />
                  My Orders
                </Link>

                <div className="relative flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                  <div className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center p-0 rounded-full bg-primary text-white text-[10px] border-none">
                      2
                    </Badge>
                  </div>
                  <span className="hidden lg:inline text-sm font-medium">Notifications</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors outline-none">
                    <User className="h-5 w-5" />
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white text-black border-none rounded-md shadow-lg">
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.PROFILE.VIEW} className="cursor-pointer font-medium">Profile Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 font-medium focus:text-red-600">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        )}
      </div>

    </>
  );
};

export const DesktopBottomRow = ({
  mounted,
  isSeller,
  handleCategoryClick,
  handleSellClick,
  router, // We might need router for the dashboard button
}: {
  mounted: boolean;
  isSeller: boolean;
  handleCategoryClick: (category: string) => void;
  handleSellClick: () => void;
  router: any;
}) => {
  return (
    <div className="hidden md:flex mx-auto h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-6 whitespace-nowrap overflow-x-auto no-scrollbar">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            {category}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-4 shrink-0 ml-6">
        {mounted && isSeller && (
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.SELLER.DASHBOARD)}
            className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white gap-2 h-9 rounded-md"
          >
            <LayoutDashboard className="h-4 w-4" />
            Seller Dashboard
          </Button>
        )}

        <Button
          onClick={handleSellClick}
          className="bg-primary hover:bg-primary/90 text-white font-medium px-6 h-9 rounded-md shadow-md"
        >
          Sell
        </Button>
      </div>
    </div>
  );
};
