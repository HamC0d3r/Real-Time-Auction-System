import Link from "next/link";
import { CheckCircle2, Mail, Star, ChevronRight } from "lucide-react";
import { ROUTES } from "@/config/routes.config";
import type { Seller } from "../../types/auction.types";

interface SellerInfoProps {
  seller: Seller;
}

export function SellerInfo({ seller }: SellerInfoProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-bold text-foreground uppercase tracking-wider opacity-70">
        Seller Information
      </h2>

      <div className="flex items-center justify-start gap-12">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Link
            href={ROUTES.SELLER.PROFILE(seller.id)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-base font-bold text-foreground select-none ring-2 ring-border/50 hover:ring-primary transition-all cursor-pointer"
          >
            {seller.avatarInitial}
          </Link>
          <div className="flex flex-col">
            <Link
              href={ROUTES.SELLER.PROFILE(seller.id)}
              className="text-base font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {seller.fullName}
            </Link>
            <div className="flex flex-col gap-2 mt-2">
              {seller.isVerified && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span className="text-[11px] text-primary font-bold">
                    Verified Seller
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[11px] text-foreground font-bold">
                <Mail className="size-3 shrink-0 text-muted-foreground" />
                <span>{seller.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Stats: Rating above Reviews */}
        <div className="flex flex-col items-center gap-4 pl-12 border-l border-border">
          {/* Rating */}
          <Link
            href={ROUTES.SELLER.PROFILE(seller.id)}
            className="group flex flex-col items-center transition-colors hover:text-primary cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight">
                {seller.rating}
              </span>
              <Star className="size-4 fill-yellow-400 text-yellow-400 group-hover:fill-primary group-hover:text-primary transition-colors" />
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-primary/70 transition-colors">
              Rating
            </span>
          </Link>

          {/* Reviews */}
          <Link
            href={ROUTES.SELLER.PROFILE(seller.id)}
            className="group flex flex-col items-center transition-colors hover:text-primary cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight">
                {seller.reviews}
              </span>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-primary/70 transition-colors">
              Reviews
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
