"use client";

// Force hot-reload trigger for reviews and bidder participation summary updates


import { useState } from "react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPublicUserProfile } from "../../api/get-public-user-profile";
import {
  useGetSellerReviews,
  useGetSellerProfileAuctions,
  SellerReviewsTab,
  SellerAuctionsTab,
} from "@/features/seller";

import { UserProfileHeader } from "./UserProfileHeader";
import { ProfileTabs } from "./ProfileTabs";
import { PublicActivitySection } from "./PublicActivitySection";

interface UserProfilePageProps {
  userId: string;
}

export function UserProfilePage({ userId }: UserProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"reviews" | "auctions">("reviews");
  const [reviewsPage, setReviewsPage] = useState(1);
  const [auctionsPage, setAuctionsPage] = useState(1);

  // Fetch public user profile details (unified bidder/seller)
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useGetPublicUserProfile(userId);

  const isSeller = profile?.roles.includes("Seller") ?? false;

  // Fetch seller-specific data only if the user is a Seller
  const { data: reviewsData, isLoading: isReviewsLoading } = useGetSellerReviews(
    userId,
    reviewsPage,
    6
  );

  const { data: auctionsData, isLoading: isAuctionsLoading } = useGetSellerProfileAuctions(
    userId,
    auctionsPage,
    6
  );

  if (isProfileError) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
          <p className="text-lg font-medium text-destructive">
            Failed to load public user profile
          </p>
          <Button
            type="button"
            onClick={() => refetchProfile()}
            className="px-5 py-2 text-sm font-semibold cursor-pointer h-auto bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </Button>
        </div>
      </PageWrapper>
    );
  }

  // Determine loading state
  const isDataLoading =
    isProfileLoading ||
    (isSeller && (isReviewsLoading || isAuctionsLoading));

  if (isDataLoading) {
    return (
      <PageWrapper>
        <div className="flex flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <Skeleton className="h-[200px] w-full rounded-2xl" />

          {/* Tabs Skeleton */}
          <div className="flex justify-center gap-4 border-b border-border/60 pb-6">
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-44 rounded-full" />
          </div>

          {/* List Skeleton */}
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!profile) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center gap-2 py-24 px-4 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            User not found
          </p>
          <p className="text-sm text-muted-foreground">
            The requested public profile does not exist or has been deactivated.
          </p>
        </div>
      </PageWrapper>
    );
  }

  const totalReviews = reviewsData?.totalCount ?? 0;
  const totalAuctions = auctionsData?.totalCount ?? 0;

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Profile Card Header */}
        <UserProfileHeader profile={profile} />

        {isSeller ? (
          <>
            {/* Secondary Bidder Stats Block for Sellers (placed above tabs) */}
            <PublicActivitySection profile={profile} />

            {/* Tab Buttons Container */}
            <ProfileTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              totalReviews={totalReviews}
              totalAuctions={totalAuctions}
            />

            {/* Active Tab Panel */}
            <div className="transition-all duration-300">
              {activeTab === "reviews" ? (
                <SellerReviewsTab
                  sellerId={userId}
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
          </>
        ) : (
          /* Bidder Only Activity Block */
          <PublicActivitySection profile={profile} />
        )}
      </div>
    </PageWrapper>
  );
}
