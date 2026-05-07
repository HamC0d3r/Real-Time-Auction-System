import Link from "next/link";
import { APP_CONFIG } from "@/config/app.config";
import { ROUTES } from "@/config/routes.config";

/**
 * Site footer.
 *
 * Stub implementation — expand with link columns, social icons,
 * and legal links as the platform matures.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} {APP_CONFIG.name}. All rights reserved.
        </p>

        <nav className="flex gap-4">
          <Link
            href={ROUTES.AUCTIONS.LIST}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Auctions
          </Link>
          {/* TODO: Add more footer links */}
        </nav>
      </div>
    </footer>
  );
}
