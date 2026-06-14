"use client";

import Link from "next/link";
import { Star, Clock } from "lucide-react";

interface ReviewHeaderProps {
  reviewerName: string;
  reviewerInitial: string;
  reviewerId?: string;
  rating: number;
  createdAt: string;
}

const getAvatarGradient = (initials: string) => {
  const charCodeSum = initials.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = charCodeSum % 360;
  return {
    background: `linear-gradient(135deg, hsl(${hue}, 80%, 94%) 0%, hsl(${(hue + 40) % 360}, 80%, 88%) 100%)`,
    color: `hsl(${hue}, 80%, 25%)`,
  };
};

export function ReviewHeader({
  reviewerName,
  reviewerInitial,
  reviewerId,
  rating,
  createdAt,
}: ReviewHeaderProps) {
  const avatarStyle = getAvatarGradient(reviewerInitial);

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      {/* Reviewer Details */}
      <div className="flex items-center gap-4">
        <Link
          href={reviewerId ? `/users/${reviewerId}` : "#"}
          className="flex size-12 shrink-0 items-center justify-center rounded-full text-base font-extrabold shadow-2xs transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-neutral-50"
          style={avatarStyle}
        >
          {reviewerInitial}
        </Link>
        <div className="flex flex-col">
          <Link
            href={reviewerId ? `/users/${reviewerId}` : "#"}
            className="text-base font-bold text-neutral-800 tracking-tight hover:text-primary transition-colors cursor-pointer"
          >
            {reviewerName}
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/60">
              <Star className="size-3 fill-amber-500 text-amber-500" />
              <span className="text-xs font-black text-amber-700">
                {rating.toFixed(1)}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-neutral-400">Verified Buyer</span>
          </div>
        </div>
      </div>

      {/* Time Stamp */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-full shrink-0 self-start border border-neutral-100/50">
        <Clock className="size-3.5 text-neutral-400/80" />
        <span>{createdAt}</span>
      </div>
    </div>
  );
}
