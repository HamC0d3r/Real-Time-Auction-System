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
    <footer className="bg-dark text-white border-t border-white/10">
      <div className="mx-auto flex max-w-[1408px] flex-col items-center gap-4  py-10 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center sm:items-start gap-2">
          <Link href={ROUTES.HOME} className="text-xl font-bold tracking-tight">
            <span className="text-white">Mazad</span>
            <span className="text-primary">Zone</span>
          </Link>
          <p className="text-xs text-gray-400">
            &copy; {currentYear} MazadZone. All rights reserved.
          </p>
        </div>

        <nav className="flex gap-8">
          <Link
            href={ROUTES.AUCTIONS.LIST}
            className="text-sm text-gray-300 transition-colors hover:text-primary"
          >
            Browse Auctions
          </Link>
          <Link
            href={ROUTES.HOME}
            className="text-sm text-gray-300 transition-colors hover:text-primary"
          >
            How it Works
          </Link>
          <Link
            href={ROUTES.HOME}
            className="text-sm text-gray-300 transition-colors hover:text-primary"
          >
            Support
          </Link>
        </nav>
      </div>
    </footer>
  );
}
