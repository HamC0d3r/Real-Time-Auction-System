import Link from "next/link";
import { ROUTES } from "@/config/routes.config";
import { APP_CONFIG } from "@/config/app.config";
import { ModeToggle } from "./mode-toggle";

/**
 * Site header with primary navigation.
 *
 * Stub implementation — expand with responsive nav, user menu,
 * and notification bell as features are built out.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link
          href={ROUTES.HOME}
          className="text-xl font-bold tracking-tight"
        >
          {APP_CONFIG.name}
        </Link>

        {/* Primary nav — TODO: render from MAIN_NAV config */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href={ROUTES.AUCTIONS.LIST}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Auctions
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          {/* TODO: Auth buttons / User menu */}
        </div>
      </div>
    </header>
  );
}
