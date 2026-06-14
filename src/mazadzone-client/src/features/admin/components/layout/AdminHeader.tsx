"use client";

import React, { useEffect } from "react";
import { Calendar, ChevronDown, RefreshCw, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalHeaderSearch } from "@/components/layout/header/GlobalHeaderSearch";
import {
  NotificationPopover,
  useGetUnreadCount,
  useRealtimeNotifications,
  useNotificationSync,
  useNotificationStore,
} from "@/features/notifications";

export interface AdminHeaderProps {
  title?: string;
  timeRange?: string;
  onTimeRangeChange?: (value: string) => void;
  onRefresh?: () => void;
  showTimeRange?: boolean;
  showRefresh?: boolean;
}

export function AdminHeader({
  title = "Admin Dashboard Overview",
  timeRange = "30",
  onTimeRangeChange,
  onRefresh,
  showTimeRange = false,
  showRefresh = false,
}: AdminHeaderProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Hook up real-time SignalR notifications and sound/toast synchronizations
  useRealtimeNotifications(user?.id);
  useNotificationSync();

  // Fetch server count once on mount — used to hydrate the Zustand store
  const { data: serverUnreadCount } = useGetUnreadCount(user?.id || "", {
    enabled: isAuthenticated,
  });

  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const consumeOptimistic = useNotificationStore((state) => state._consumeOptimistic);

  // Hydrate the Zustand badge from server data on initial load and after background refetches.
  useEffect(() => {
    if (serverUnreadCount !== undefined) {
      const wasOptimistic = consumeOptimistic();
      if (!wasOptimistic) {
        setUnreadCount(serverUnreadCount);
      }
    }
  }, [serverUnreadCount, setUnreadCount, consumeOptimistic]);

  const handleLogout = () => {
    logout();
    router.push(ROUTES.AUTH.LOGIN);
  };

  return (
    <header className="h-20 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Page Title */}
      <div className="shrink-0 mr-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
      </div>

      {/* Central Search bar (reusable GlobalHeaderSearch) */}
      <GlobalHeaderSearch
        isAdmin={true}
        placeholder="Search users, auctions, categories..."
        containerClassName="relative hidden md:block flex-1 max-w-xl mx-6"
        inputClassName="pl-9 h-10 w-full bg-background/50 border-input hover:border-muted-foreground/30 focus-visible:ring-ring"
        iconClassName="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        iconPosition="left"
      />

      {/* Header Controls */}
      <div className="flex items-center gap-4 shrink-0 justify-end">
        {/* Time range select */}
        {showTimeRange && onTimeRangeChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 gap-2 border-border text-foreground hover:bg-muted text-sm font-medium"
              >
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {timeRange === "7"
                    ? "Last 7 days"
                    : timeRange === "30"
                    ? "Last 30 days"
                    : timeRange === "90"
                    ? "Last 90 days"
                    : timeRange === "year"
                    ? "Last year"
                    : timeRange === "5years"
                    ? "Last 5 years"
                    : "Last 30 days"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card text-foreground border-border w-40">
              <DropdownMenuItem onClick={() => onTimeRangeChange("7")}>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTimeRangeChange("30")}>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTimeRangeChange("90")}>Last 90 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTimeRangeChange("year")}>Last year</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTimeRangeChange("5years")}>Last 5 years</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Sync Button */}
        {showRefresh && onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            title="Refresh statistics"
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </Button>
        )}

        {/* Notifications */}
        <NotificationPopover unreadCount={unreadCount} />

        {/* Divider */}
        <div className="h-6 w-px bg-border hidden sm:block" />

        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-hidden group">
            <div className="h-9 w-9 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center text-primary font-semibold border border-primary/20">
              {user?.fullName?.charAt(0) || "A"}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-none">
                {user?.fullName || "Admin"}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                Admin Panel
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card text-foreground border-border">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={ROUTES.PROFILE.VIEW} className="cursor-pointer flex items-center gap-2">
                <User className="h-4 w-4" /> Profile Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
