"use client";

import { useState } from "react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { MessageSquare, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetSellerProfile,
  useGetSellerReviews,
  useGetSellerProfileAuctions,
} from "../api/seller.queries";
import { SellerProfileHeader } from "./SellerProfileHeader";
import { SellerReviewsTab } from "./SellerReviewsTab";
import { SellerAuctionsTab } from "./SellerAuctionsTab";

interface SellerProfilePageProps {
  sellerId: string;
}

export function SellerProfilePage({ sellerId }: SellerProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"reviews" | "auctions">("reviews");
  const [reviewsPage, setReviewsPage] = useState(1);
  const [auctionsPage, setAuctionsPage] = useState(1);

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useGetSellerProfile(sellerId);

  const { data: reviewsData, isLoading: isReviewsLoading } =
    useGetSellerReviews(sellerId, reviewsPage, 6);

  const { data: auctionsData, isLoading: isAuctionsLoading } =
    useGetSellerProfileAuctions(sellerId, auctionsPage, 6);

  if (isProfileError) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <p className="text-lg font-medium text-destructive">
            Failed to load seller profile
          </p>
          <Button
            type="button"
            onClick={() => refetchProfile()}
            className="px-5 py-2 text-sm font-semibold cursor-pointer h-auto"
          >
            Try Again
          </Button>
        </div>
      </PageWrapper>
    );
  }

  if (isProfileLoading || isReviewsLoading || isAuctionsLoading) {
    return (
      <PageWrapper>
        <div className="flex flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <Skeleton className="h-[200px] w-full rounded-xl" />

          {/* Tabs Skeleton */}
          <div className="flex justify-center gap-4 border-b border-border/60 pb-6">
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-44 rounded-full" />
          </div>

          {/* List Skeleton */}
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!profile) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center gap-2 py-24">
          <p className="text-lg font-medium text-muted-foreground">
            Seller not found
          </p>
          <p className="text-sm text-muted-foreground">
            The requested seller profile does not exist or has been deactivated.
          </p>
        </div>
      </PageWrapper>
    );
  }

  const totalReviews = reviewsData?.totalCount ?? 0;
  const totalAuctions = auctionsData?.totalCount ?? 0;

  return (
    <PageWrapper>
      <div className="flex flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        {/* Profile Card Header */}
        <SellerProfileHeader profile={profile} />

        {/* Tab Buttons Container */}
        <div className="flex justify-center gap-4 border-b border-border/60 pb-6">
          <Button
            type="button"
            onClick={() => setActiveTab("reviews")}
            variant={activeTab === "reviews" ? "default" : "outline"}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer h-auto"
          >
            <MessageSquare className="size-4 shrink-0" />
            <span>Reviews ({totalReviews})</span>
          </Button>

          <Button
            type="button"
            onClick={() => setActiveTab("auctions")}
            variant={activeTab === "auctions" ? "default" : "outline"}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer h-auto"
          >
            <ShoppingBag className="size-4 shrink-0" />
            <span>Seller Auctions ({totalAuctions})</span>
          </Button>
        </div>

        {/* Active Tab Panel */}
        <div className="transition-all duration-300">
          {activeTab === "reviews" ? (
            <SellerReviewsTab
              sellerId={sellerId}
              reviews={reviewsData?.items ?? []}
              currentPage={reviewsPage}
              totalPages={reviewsData?.totalPages ?? 1}
              onPageChange={setReviewsPage}
            />
          ) : (
            <SellerAuctionsTab
              auctions={auctionsData?.items ?? []}
              currentPage={auctionsPage}
              totalPages={auctionsData?.totalPages ?? 1}
              onPageChange={setAuctionsPage}
            />
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
