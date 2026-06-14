"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Gavel,
  ShieldAlert,
  FolderOpen,
  LogOut,
  Menu,
  X,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";

interface SidebarNavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function SidebarNavItem({ href, icon: Icon, label, isActive, onClick }: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 py-3 px-6 text-sm font-medium transition-all group outline-none",
        isActive
          ? "text-primary bg-primary/5 font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
      )}
    >
      {/* Active state border indicator */}
      {isActive && (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md animate-fade-in" />
      )}
      <Icon
        className={cn(
          "h-5 w-5 transition-transform group-hover:scale-110",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <span>{label}</span>
    </Link>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    { href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard, label: "Overview" },
    { href: ROUTES.ADMIN.USERS ?? "/admin/users", icon: Users, label: "Moderate Users" },
    { href: ROUTES.ADMIN.AUCTIONS ?? "/admin/auctions", icon: Gavel, label: "Moderate Auctions" },
    { href: ROUTES.ADMIN.DISPUTES ?? "/admin/disputes", icon: ShieldAlert, label: "Resolve Disputes" },
    { href: "/admin/categories", icon: FolderOpen, label: "Manage Categories" },
    { href: ROUTES.ADMIN.ACCESS, icon: KeyRound, label: "Access Management" },
  ];

  const handleLogout = () => {
    logout();
    router.push(ROUTES.AUTH.LOGIN);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Header Toggle */}
      <div className="flex md:hidden fixed top-0 left-0 right-0 h-16 items-center justify-between px-4 bg-dark text-dark-foreground border-b border-white/5 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white tracking-wide">
            Mazad<span className="text-primary">Zone</span>
          </span>
          <span className="text-xs uppercase font-semibold tracking-wider text-muted-foreground px-2 py-0.5 rounded-full bg-white/10">
            Admin
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-white hover:bg-white/10"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 w-64 bg-dark text-dark-foreground border-r border-white/5 flex flex-col z-40 transition-transform duration-300 md:translate-x-0 md:static md:h-screen",
          isMobileOpen ? "translate-x-0 pt-16 md:pt-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="hidden md:flex h-20 items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white tracking-wide">
              Mazad<span className="text-primary">Zone</span>
            </span>
            <span className="text-xs uppercase font-semibold tracking-wider text-muted-foreground px-2 py-0.5 rounded-full bg-white/10">
              Admin
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isActive}
                onClick={() => setIsMobileOpen(false)}
              />
            );
          })}
        </nav>

        {/* Theme Settings & Extra Controls */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-dark/40">
          <span className="text-xs text-muted-foreground">System Theme</span>
          <ModeToggle />
        </div>

        {/* User Profile Block */}
        <div className="p-4 border-t border-white/5 bg-dark/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/45 overflow-hidden flex items-center justify-center text-primary font-semibold text-lg">
              {user?.fullName?.charAt(0) || "A"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white leading-none">
                {user?.fullName || "Admin"}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 leading-none">
                Super Administrator
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Log Out"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
          >
            <LogOut className="h-4.5 w-4.5" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden pt-16 md:pt-0">
        <main className="flex-1 overflow-y-auto bg-background/50 relative">
          {children}
        </main>
      </div>

      {/* Backdrop for mobile drawer */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden animate-fade-in"
        />
      )}
    </div>
  );
}
