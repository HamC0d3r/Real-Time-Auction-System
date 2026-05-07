import Link from "next/link";
import { ROUTES } from "@/config/routes.config";

/**
 * Home page — thin wrapper.
 *
 * TODO: Replace with a proper HomePage feature component
 * once the home/landing feature module is built.
 */
export default function Page() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-background px-4 py-16 font-sans">
      <h1 className="text-4xl font-bold tracking-tight">
        Welcome to MazadZone
      </h1>
      <p className="max-w-md text-center text-muted-foreground">
        The real-time C2C auction platform. Browse live auctions, place bids,
        and win great deals.
      </p>
      <Link
        href={ROUTES.AUCTIONS.LIST}
        className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Browse Auctions
      </Link>
    </div>
  );
}
