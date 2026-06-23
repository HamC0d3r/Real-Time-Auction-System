"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MoveRight } from "lucide-react";
import { AuctionCard, AuctionCardSkeleton } from "../auction-card";
import { AuctionActionSlot } from "../AuctionActionSlot";
import { useGetHomeAuctions } from "../../api";
import { ROUTES } from "@/config/routes.config";

export function EndingSoonSection() {
  const { data, isLoading, isError } = useGetHomeAuctions(4);
  const auctions = data?.endingSoon;

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
    <section className="w-full pt-8 pb-10 px-6 mt-10 rounded-2xl border border-primary/10 bg-primary/[0.02] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Ending Soon
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
            <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
            Ending Soon
          </span>
        </div>
        <Link
          href={`${ROUTES.AUCTIONS.LIST}?sortBy=EndTime&sortDirection=asc&status=Active`}
          className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all text-sm md:text-base"
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
