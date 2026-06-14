"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Star, Calendar, Shield, Mail, Phone } from "lucide-react";
import type { PublicUserProfile } from "../../types/user-profile.types";
import { cn } from "@/lib/utils";

import { getProfileStatItems } from "../../constants/user-profile.constants";

interface AvatarImageProps {
  src?: string | null;
  alt: string;
  fallbackInitial: string;
}

function AvatarImage({ src, alt, fallbackInitial }: AvatarImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary">
        {fallbackInitial}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="96px"
      className="object-cover"
      onError={() => setError(true)}
    />
  );
}

interface UserProfileHeaderProps {
  profile: PublicUserProfile;
}

export function UserProfileHeader({ profile }: UserProfileHeaderProps) {
  const isSeller = profile.roles.includes("Seller");
  const isAdmin = profile.roles.includes("Admin");

  // Render star ratings helper
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "size-4 transition-transform hover:scale-110",
              i < fullStars
                ? "fill-amber-500 text-amber-500"
                : i === fullStars && hasHalf
                ? "fill-amber-500 text-amber-500 opacity-50"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
    );
  };

  const allStatItems = getProfileStatItems(profile);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-md transition-all duration-300 hover:shadow-lg dark:bg-card">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Left Side: Avatar & Core Information */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Avatar Container */}
          <div className="relative size-24 shrink-0 overflow-hidden rounded-full border border-border bg-muted ring-4 ring-primary/10 transition-transform duration-300 hover:scale-105">
            <AvatarImage
              key={profile.avatarUrl}
              src={profile.avatarUrl}
              alt={profile.fullName}
              fallbackInitial={profile.avatarInitial}
            />
          </div>

          {/* User Details */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-foreground tracking-tight sm:text-3xl">
                {profile.fullName}
              </h1>

              {/* Verified Badge */}
              {profile.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary shadow-xs">
                  <CheckCircle2 className="size-3.5 fill-primary text-primary-foreground" />
                  {isSeller ? "Verified Seller" : "Verified User"}
                </span>
              )}

              {/* Admin Badge */}
              {isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold text-purple-600 dark:text-purple-400 shadow-xs">
                  <Shield className="size-3.5" />
                  Admin
                </span>
              )}
            </div>

            {/* Ratings & Contact Info */}
            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-sm text-muted-foreground">
              {isSeller && profile.sellerRating !== undefined && (
                <>
                  <div className="flex items-center gap-1.5">
                    {renderStars(profile.sellerRating)}
                    <span className="font-bold text-foreground">{profile.sellerRating}</span>
                    <span className="text-muted-foreground">
                      ({profile.reviewsCount} reviews)
                    </span>
                  </div>
                  <span className="text-muted-foreground/30">|</span>
                </>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span>Member since {profile.memberSince}</span>
              </div>
            </div>

            {/* Contact Email/Phone (Public-Safe only) */}
            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs font-semibold text-muted-foreground mt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground/75" />
                <span className="break-all">{profile.email}</span>
              </div>
              {profile.phoneNumber && (
                <div className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground/75" />
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
            </div>

            {profile.bio && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Quick Stats Highlights with modern micro-animations */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:shrink-0">
          {allStatItems.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.key}
                className={cn(
                  "group flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4 text-center min-w-[110px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
                  stat.borderHoverClassName
                )}
              >
                <div className={cn("flex items-center gap-1.5 font-bold text-lg", stat.textClassName)}>
                  <Icon className={cn("size-4 shrink-0 group-hover:scale-115 transition-transform", stat.iconClassName)} />
                  <span className={stat.valueClassName}>{stat.value}</span>
                </div>
                <span className="mt-1.5 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
