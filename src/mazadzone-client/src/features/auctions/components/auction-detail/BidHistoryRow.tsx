import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Crown, Trophy, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency.utils";
import type { BidHistoryEntry } from "../../types/auction.types";
import { useGetPublicUserProfile } from "@/features/profile";

interface BidHistoryRowProps {
  entry: BidHistoryEntry;
}

export function BidHistoryRow({ entry }: BidHistoryRowProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([obsEntry]) => {
        if (obsEntry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isGuid = entry.bidderId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entry.bidderId) : false;
  const { data: profile } = useGetPublicUserProfile(
    isGuid && isVisible ? entry.bidderId! : "",
    false
  );

  const bidderId = entry.bidderId || `bidder-${entry.bidderName.toLowerCase().replace(/\s/g, "-").replace(/\./g, "")}`;
  const displayName = profile?.fullName || entry.bidderName;
  const displayInitial = profile?.avatarInitial || entry.bidderInitial;

  if (entry.isHighest) {
    return (
      <div
        ref={containerRef}
        className={cn(
          "relative flex items-center justify-between p-4 mb-3 rounded-xl border transition-all duration-300",
          "bg-gradient-to-r from-orange-500/[0.04] to-amber-500/[0.02]",
          "border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.08)]",
          "hover:shadow-[0_0_25px_rgba(249,115,22,0.12)] hover:border-orange-500/30"
        )}
      >
        <div className="flex items-center gap-4">
          {/* Avatar Area with Laurel Wreath & Tilted Crown */}
          <div className="relative shrink-0">
            {/* Laurel Wreath */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-[1.4] opacity-50 select-none">
              <svg className="size-12 text-orange-500/25" viewBox="0 0 100 100" fill="currentColor">
                <path d="M 30,85 C 20,70 18,50 25,30 C 27,25 31,18 36,15 C 34,19 32,24 32,29 C 30,45 35,60 42,72 C 38,77 34,81 30,85 Z" />
                <path d="M 70,85 C 80,70 82,50 75,30 C 73,25 69,18 64,15 C 66,19 68,24 68,29 C 70,45 65,60 58,72 C 62,77 66,81 70,85 Z" />
              </svg>
            </div>

            {/* Avatar Bubble */}
            <Link
              href={`/users/${bidderId}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-base font-extrabold select-none cursor-pointer transition-all hover:scale-105 ring-4 ring-background shadow-md bg-gradient-to-tr from-orange-500 to-amber-400 text-white"
            >
              {displayInitial}
              {/* Tilted Gold Crown */}
              <Crown className="absolute -top-3 -right-1 size-5 fill-amber-500 text-amber-500 drop-shadow-sm rotate-[15deg] stroke-[1.5]" />
            </Link>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/users/${bidderId}`}
                className="text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none"
              >
                {displayName}
              </Link>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[9px] font-extrabold text-orange-600 border border-orange-500/15 uppercase tracking-wider select-none">
                <Trophy className="size-2.5 fill-orange-500" />
                Leading Bid
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
              <Calendar className="size-3.5 text-muted-foreground/60" />
              <span>{entry.timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Amount with Sparkles */}
        <div className="relative pr-3">
          <span className="text-xl md:text-2xl font-black text-orange-600 tracking-tight">
            {formatCurrency(entry.amount)}
          </span>
          <Sparkles className="absolute -top-3 -right-1 size-4 text-amber-500 fill-amber-400 animate-pulse" />
        </div>
      </div>
    );
  }

  // Standard bidder card
  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center justify-between p-3.5 mb-2.5 rounded-xl border border-border/50 bg-card/60 transition-all duration-200",
        "hover:border-border hover:shadow-2xs"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <Link
          href={`/users/${bidderId}`}
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold select-none cursor-pointer transition-all hover:scale-105 bg-muted text-foreground hover:ring-2 hover:ring-primary/45 border border-border/20"
        >
          {displayInitial}
        </Link>
        <div className="flex flex-col">
          <Link
            href={`/users/${bidderId}`}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none"
          >
            {displayName}
          </Link>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
            <Calendar className="size-3.5 text-muted-foreground/50" />
            <span>{entry.timeAgo}</span>
          </div>
        </div>
      </div>

      <span className="text-sm font-bold text-foreground">
        {formatCurrency(entry.amount)}
      </span>
    </div>
  );
}
