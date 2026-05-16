"use client";

import { useState } from "react";
import { BidActivityRow } from "./BidActivityRow";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth.store";
import { useGetMyBids } from "../../api/bidding.queries";

// Subcomponents
import { MyBidsFilters } from "./MyBidsFilters";
import { BidRowsSkeleton } from "./BidRowsSkeleton";
import { EmptyBidsState } from "./EmptyBidsState";
import { ErrorBidsState } from "./ErrorBidsState";
import { UnauthenticatedState } from "./UnauthenticatedState";

const FILTERS = ["All", "Leading", "Outbid", "Ended"] as const;
type FilterType = typeof FILTERS[number];

export function MyBidsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [sortBy, setSortBy] = useState("latest");

  // Retrieve auth context dynamically
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;

  // Retrieve bidding activities via unified query API, enabled only for authenticated users
  const { data: bids = [], isLoading, isError, refetch } = useGetMyBids(user?.id || "");

  const filteredActivities = bids.filter((activity) => {
    if (activeFilter === "All") return true;
    return activity.status === activeFilter;
  });

  // Dynamic sorting logic
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    const timeA = new Date(a.auction.timing.endDate).getTime();
    const timeB = new Date(b.auction.timing.endDate).getTime();
    if (sortBy === "latest") {
      return timeA - timeB;
    }
    if (sortBy === "oldest") {
      return timeB - timeA;
    }
    return 0;
  });

  return (
    <div className="w-full max-w-[1398px] mx-auto my-11 rounded-xl px-4 md:px-6 py-8 md:py-12 bg-primary-foreground">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bids</h1>
        <Badge className="bg-[#1E2530] hover:bg-[#1E2530]/90 text-white rounded-full px-6 h-14 text-lg font-semibold flex items-center justify-center">
          {filteredActivities.length} total
        </Badge>
      </div>

      {/* Filters and Sort */}
      <MyBidsFilters
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filters={FILTERS}
      />

      {/* Dynamic Data States */}
      {!isAuthenticated ? (
        <UnauthenticatedState />
      ) : isLoading ? (
        <BidRowsSkeleton />
      ) : isError ? (
        <ErrorBidsState onRetry={refetch} />
      ) : sortedActivities.length === 0 ? (
        <EmptyBidsState />
      ) : (
        <div className="flex flex-col gap-4">
          {sortedActivities.map((activity, index) => (
            <BidActivityRow key={`${activity.id}-${index}`} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
