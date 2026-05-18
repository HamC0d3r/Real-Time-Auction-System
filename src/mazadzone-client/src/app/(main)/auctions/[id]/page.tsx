import { AuctionDetailPage } from "@/features/auctions";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15+, params is a Promise and must be awaited.
  const { id } = await params;
  return <AuctionDetailPage id={id} />;
}
