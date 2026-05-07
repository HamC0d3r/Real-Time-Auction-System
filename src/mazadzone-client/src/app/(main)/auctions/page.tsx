import { AuctionsPage } from "@/features/auctions/components/auctions-page";

/**
 * Auctions list page — thin wrapper.
 *
 * This demonstrates the thin-page pattern:
 * - No business logic here
 * - No data fetching here
 * - Just import and render the feature's page-level component
 */
export default function Page() {
  return <AuctionsPage />;
}
