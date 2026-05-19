"use client";

import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { ROUTES } from "@/config/routes.config";
import { useRequireRole } from "@/hooks/use-require-role";

import { useGetAuctionById } from "../../api/auction.queries";
import { EditAuctionForm } from "./EditAuctionForm";

interface EditAuctionPageProps {
  id: string;
}

export function EditAuctionPage({ id }: EditAuctionPageProps) {
  // Authenticate and authorize checks for seller role
  const { isAuthorized, isLoading: isAuthLoading } = useRequireRole(["seller"], {
    loginMessage: "Please log in to edit this auction.",
    unauthorizedMessage: "You must activate your seller privileges to edit auctions.",
    bypassTesting: true, // Keep bypass testing for local development/testing
  });

  // Fetch existing auction details
  const { data: auction, isLoading: isQueryLoading, isError: isQueryError } = useGetAuctionById(id);

  // Loading Boundary
  if (isAuthLoading || !isAuthorized || isQueryLoading) {
    const loadingText = isAuthLoading || !isAuthorized 
      ? "Verifying credentials..." 
      : "Loading auction details...";
    return (
      <PageWrapper className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-semibold">{loadingText}</p>
        </div>
      </PageWrapper>
    );
  }

  // Error Boundary
  if (isQueryError || !auction) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4 max-w-md p-6 bg-card rounded-2xl border shadow-sm">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Failed to Load Auction</h2>
          <p className="text-muted-foreground">
            The requested auction details could not be found or there was an error fetching the data from the server.
          </p>
          <div className="pt-2">
            <Link href={ROUTES.SELLER.AUCTIONS}>
              <Button className="rounded-xl cursor-pointer">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-10 px-4 md:px-6 animate-fade-in">
      <main className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-4 text-left">
          <Link href={ROUTES.SELLER.AUCTIONS} className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <ArrowLeft className="h-4.5 w-4.5 stroke-[2.2]" />
            Back to Auctions
          </Link>
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight md:text-4xl">
              Edit Auction
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Update your auction details and timing settings
            </p>
          </div>
        </div>

        {/* Separated Edit Auction Form Component */}
        <EditAuctionForm auction={auction} />

      </main>
    </PageWrapper>
  );
}
