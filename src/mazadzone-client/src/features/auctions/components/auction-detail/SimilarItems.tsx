"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuctionCard, AuctionCardSkeleton } from "../auction-card";
import { useGetSimilarAuctions } from "../../api";
import type { AuctionCategory, AuctionSubcategory, AuctionSummary } from "../../types/auction.types";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";

interface SimilarItemsProps {
  auctionId: string;
  category: AuctionCategory;
  subcategory: AuctionSubcategory;
}

/**
 * Section displaying similar auctions based on category/subcategory.
 * Displays up to 4 items in a grid.
 */
export function SimilarItems({ auctionId, category, subcategory }: SimilarItemsProps) {
  const { data: similarAuctions, isLoading } = useGetSimilarAuctions(
    auctionId,
    category,
    subcategory
  );

  // Link to view all auctions with the same filters
  const viewAllHref = `${ROUTES.AUCTIONS.LIST}?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`;

  if (!isLoading && (!similarAuctions || similarAuctions.length === 0)) {
    return null;
  }

  return (
    <section className="mt-16 space-y-8">
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Similar Items
          </h2>
          <p className="text-sm text-muted-foreground">
            Other auctions you might be interested in.
          </p>
        </div>

        <Link
          href={viewAllHref}
          className="group flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          View All
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* ── Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <AuctionCardSkeleton key={i} />
            ))
          : similarAuctions?.map((auction: AuctionSummary) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onFavoriteClick={() => {}} // TODO: Global favorite handler if needed
                className="animate-in fade-in slide-in-from-bottom-3 duration-500"
              />
            ))}
      </div>
    </section>
  );
}
