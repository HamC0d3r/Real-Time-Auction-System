"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { AuctionCard, AuctionCardSkeleton } from "../auction-card";
import { AuctionActionSlot } from "../AuctionActionSlot";
import { useGetSimilarAuctions } from "../../api";
import type { AuctionCategory, AuctionSubcategory, AuctionSummary } from "../../types/auction.types";
import { ROUTES } from "@/config/routes.config";

interface SimilarItemsProps {
  auctionId: string;
  category: AuctionCategory;
  subcategory: AuctionSubcategory;
}

export function SimilarItems({ auctionId, category, subcategory }: SimilarItemsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { data: similarAuctions, isLoading } = useGetSimilarAuctions(
    isVisible ? auctionId : "",
    category,
    subcategory
  );

  const actionSlots = useMemo(() => {
    if (!similarAuctions) return new Map<string, React.ReactNode>();
    const map = new Map<string, React.ReactNode>();
    for (const auction of similarAuctions) {
      map.set(auction.id, (
        <AuctionActionSlot
          auctionId={auction.id}
          status={auction.status}
          isOwner={auction.isOwner}
        />
      ));
    }
    return map;
  }, [similarAuctions]);

  const viewAllHref = `${ROUTES.AUCTIONS.LIST}?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`;

  if (!isVisible) {
    return <div ref={containerRef} className="mt-16 h-20" />;
  }

  if (!isLoading && (!similarAuctions || similarAuctions.length === 0)) {
    return null;
  }

  return (
    <section ref={containerRef} className="mt-16 space-y-8">
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <AuctionCardSkeleton key={i} />
            ))
          : similarAuctions?.map((auction: AuctionSummary) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                className="animate-in fade-in slide-in-from-bottom-3 duration-500"
                actionSlot={actionSlots.get(auction.id)}
              />
            ))}
      </div>
    </section>
  );
}
