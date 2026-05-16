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
import { NotificationPopover, useGetUnreadCount } from "@/features/notifications";
import { useAuthStore } from "@/stores/auth.store";

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
  const user = useAuthStore((state) => state.user);
  const { data: unreadCount = 0 } = useGetUnreadCount(user?.id || "", { enabled: isAuthenticated });


  return (
    <>
      {/* Desktop Search Bar (Part of Top Row) */}
      <div className="hidden md:flex flex-1 max-w-xl ml-5 mr-7 relative mx-0 pr-0">
        <Input
          className="w-full bg-white text-black  text-2xl pl-5  rounded-2xl h-13 border-none focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Search..."
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
      </div>

      {/* Right Nav (Desktop) */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center text-lg font-medium text-primary-foreground">
          <span className="cursor-pointer hover:text-white transition-colors">AR</span>
          <span className="mx-2 text-gray-500">|</span>
          <span className="cursor-pointer text-primary">EN</span>
        </div>

        {mounted && (
          <div className="flex items-center gap-6">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href={ROUTES.AUTH.LOGIN} className="text-lg font-medium hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link href={ROUTES.AUTH.REGISTER} className="text-2xl font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Sign Up
                </Link>
              </div>
            ) : (
              <>
                <Link href={ROUTES.BIDDING.MY_BIDS} className="hidden lg:flex items-center gap-2 text-xl font-medium hover:text-primary transition-colors">
                  <Gavel className="h-7 w-7" />
                  My Bids
                </Link>

                <Link href={ROUTES.ORDERS.LIST} className="hidden lg:flex items-center gap-2 text-xl font-medium hover:text-primary transition-colors">
                  <Package className="h-7 w-7" />
                  My Orders
                </Link>

                <NotificationPopover unreadCount={unreadCount} />




                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors outline-none">
                    <User className="h-7 w-7" />
                    <ChevronDown className="h-7 w-7" />
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
    <div className="hidden md:flex mx-auto h-14 max-w-[1408px] items-center justify-between pt-4 ">
      <nav className="flex items-center gap-6 whitespace-nowrap overflow-x-auto no-scrollbar pt-1.5">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className="text-lg font-normal text-primary-foreground hover:text-primary hover:border-primary transition-colors"
          >
            {category}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-9 shrink-0 ml-6">
        {mounted && isSeller && (
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.SELLER.DASHBOARD)}
            className="bg-transparent border-white/20 text-white  text-lg hover:bg-primary/20 hover:text-primary hover:border-primary gap-2 h-12 rounded-xl"
          >
            <LayoutDashboard className="h-5 w-5" />
            Seller Dashboard
          </Button>
        )}

        <Button
          onClick={handleSellClick}
          className="bg-primary hover:bg-primary/90 text-white font-medium px-6 h-12 w-24 rounded-xl shadow-md text-lg"
        >
          Sell
        </Button>
      </div>
    </div>
  );
};
