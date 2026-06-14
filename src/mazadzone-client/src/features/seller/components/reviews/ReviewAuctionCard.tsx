"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getAuctionImageFallback } from "@/features/auctions";

interface ReviewAuctionCardProps {
  auction: {
    id: string;
    title: string;
    imageUrl: string;
  };
}

export function ReviewAuctionCard({ auction }: ReviewAuctionCardProps) {
  const fallbackImg = getAuctionImageFallback(auction.title, 200, 150);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/40 p-3.5 transition-all duration-300 hover:bg-neutral-50 hover:border-neutral-200/60 w-full h-full min-w-0">
      {/* Product Image */}
      <div className="relative w-full h-28 shrink-0 overflow-hidden rounded-xl border border-neutral-200/50 bg-white shadow-2xs">
        <Image
          src={auction.imageUrl}
          alt={auction.title}
          fill
          sizes="(min-width: 768px) 200px, 100vw"
          className="object-cover transition-transform duration-500 hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = fallbackImg;
            e.currentTarget.srcset = fallbackImg;
          }}
        />
      </div>

      {/* Info Block */}
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
          Purchased Item
        </span>
        <Link
          href={`/auctions/${auction.id}`}
          className="text-xs font-bold text-neutral-800 hover:text-primary hover:underline line-clamp-2 transition-colors leading-tight tracking-tight mt-0.5"
          title={auction.title}
        >
          {auction.title}
        </Link>
      </div>

      {/* View Details Action Button */}
      <Link
        href={`/auctions/${auction.id}`}
        className="mt-auto inline-flex items-center justify-center gap-1 w-full rounded-xl border border-neutral-200 bg-white hover:bg-primary hover:text-primary-foreground hover:border-primary px-3 py-2 text-xs font-bold text-neutral-700 transition-all duration-200 cursor-pointer shadow-3xs"
      >
        <span>View Details</span>
        <ChevronRight className="size-3.5" />
      </Link>
    </div>
  );
}
