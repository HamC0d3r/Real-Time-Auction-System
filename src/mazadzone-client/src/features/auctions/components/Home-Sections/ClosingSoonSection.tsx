"use client";

import Link from "next/link";
import { MoveRight } from "lucide-react";
import { AuctionCard, AuctionCardSkeleton } from "../auction-card";
import { useGetClosingSoonAuctions } from "../../api";
import { ROUTES } from "@/config/routes.config";
import { useState, useCallback } from "react";

export function ClosingSoonSection() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { data: auctions, isLoading, isError } = useGetClosingSoonAuctions(4);

  const handleFavoriteClick = useCallback((auctionId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(auctionId)) {
        next.delete(auctionId);
      } else {
        next.add(auctionId);
      }
      return next;
    });
  }, []);

  if (isError) return null;

  return (
    <section className="w-full py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Closing Soon
        </h2>
        <Link
          href={`${ROUTES.AUCTIONS.LIST}?sortBy=EndTime&sortDirection=asc`}
          className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
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
                auction={{
                  ...auction,
                  isFavorite: favorites.has(auction.id),
                }}
                onFavoriteClick={handleFavoriteClick}
              />
            ))}
      </div>
    </section>
  );
}
