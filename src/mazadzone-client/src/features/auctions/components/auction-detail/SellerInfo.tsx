import Link from "next/link";
// Force hot-reload trigger for seller profile navigation fix
import { Mail, Star, ChevronRight } from "lucide-react";
import { ROUTES } from "@/config/routes.config";
import type { Seller } from "../../types/auction.types";

interface SellerInfoProps {
  seller: Seller;
}

export function SellerInfo({ seller }: SellerInfoProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      {/* Header with Title and Verified Badge */}
      <div className="flex items-center justify-between mb-4 select-none">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Seller Profile
        </h2>
        {seller.isVerified && (
          <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-extrabold text-success-foreground border border-success/20">
            Verified Seller
          </span>
        )}
      </div>

      <div className="flex flex-col sm:grid sm:grid-cols-12 items-stretch sm:items-center gap-4">
        {/* Avatar, Info & Chevron Row on Mobile */}
        <div className="flex items-center justify-between sm:col-span-6 min-w-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar */}
            <Link
              href={ROUTES.SELLER.PROFILE(seller.id)}
              className="flex size-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-base font-extrabold text-primary select-none hover:bg-primary/20 transition-all cursor-pointer shrink-0"
            >
              {seller.avatarInitial}
            </Link>

            {/* Info */}
            <div className="flex flex-col gap-1 min-w-0">
              <Link
                href={ROUTES.SELLER.PROFILE(seller.id)}
                className="text-base font-bold text-foreground hover:text-primary transition-colors cursor-pointer truncate"
              >
                {seller.fullName}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="size-3.5 shrink-0 text-muted-foreground/60" />
                <span className="truncate">{seller.email}</span>
              </div>
            </div>
          </div>

          {/* Chevron for Mobile Only */}
          <Link
            href={ROUTES.SELLER.PROFILE(seller.id)}
            className="group block sm:hidden cursor-pointer"
          >
            <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Stats Column/Row */}
        <Link
          href={ROUTES.SELLER.PROFILE(seller.id)}
          className="group flex flex-row sm:flex-col items-center justify-between sm:justify-center text-center transition-all hover:opacity-85 cursor-pointer sm:col-span-5 sm:border-l sm:border-border/50 py-2 sm:py-1 border-t border-border/40 sm:border-t-0 mt-1 sm:mt-0 pt-3 sm:pt-1"
        >
          <div className="flex items-center gap-1.5">
            <Star className="size-5 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors leading-none">
              {seller.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs font-bold text-muted-foreground transition-colors group-hover:text-primary/80 sm:mt-1 select-none">
            {seller.reviews} {seller.reviews === 1 ? "review" : "reviews"}
          </span>
        </Link>

        {/* Navigation Chevron (Desktop Only) */}
        <div className="hidden sm:flex sm:col-span-1 justify-end">
          <Link
            href={ROUTES.SELLER.PROFILE(seller.id)}
            className="group cursor-pointer"
          >
            <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
