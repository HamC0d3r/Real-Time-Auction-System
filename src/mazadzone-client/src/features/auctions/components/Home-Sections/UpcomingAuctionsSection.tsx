"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MoveRight } from "lucide-react";
import { AuctionCard, AuctionCardSkeleton } from "../auction-card";
import { AuctionActionSlot } from "../AuctionActionSlot";
import { useGetHomeAuctions } from "../../api";
import { ROUTES } from "@/config/routes.config";

export function UpcomingAuctionsSection() {
  const { data, isLoading, isError } = useGetHomeAuctions(4);
  const auctions = data?.upcoming;

  const actionSlots = useMemo(() => {
    if (!auctions) return new Map<string, React.ReactNode>();
    const map = new Map<string, React.ReactNode>();
    for (const auction of auctions) {
      map.set(auction.id, (
        <AuctionActionSlot
          auctionId={auction.id}
          status={auction.status}
          isOwner={auction.isOwner}
        />
      ));
    }
    return map;
  }, [auctions]);

  if (isError) return null;

  return (
    <section className="w-full py-8 mt-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground/80">
          Upcoming Auctions
        </h2>
        <Link
          href={`${ROUTES.AUCTIONS.LIST}?status=Upcoming`}
          className="flex items-center gap-2 text-primary/80 font-semibold hover:gap-3 transition-all text-sm md:text-base"
        >
          View All <MoveRight className="size-5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <AuctionCardSkeleton key={i} />
            ))
          : auctions?.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                actionSlot={actionSlots.get(auction.id)}
              />
            ))}
      </div>
    </section>
  );
}
