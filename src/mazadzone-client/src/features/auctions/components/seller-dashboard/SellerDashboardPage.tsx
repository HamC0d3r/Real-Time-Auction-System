"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/config/routes.config";
import { useRequireRole } from "@/hooks/use-require-role";

import { useGetSellerAuctions } from "../../api/auction.queries";
import { useDeleteAuction } from "../../api/auction.mutations";
import { SellerDashboardStats } from "./SellerDashboardStats";
import { SellerAuctionsTable } from "./SellerAuctionsTable";
import { SellerDashboardStatsSkeleton } from "./SellerDashboardStatsSkeleton";
import { SellerAuctionsTableSkeleton } from "./SellerAuctionsTableSkeleton";

export function SellerDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Authenticated route protection check via reusable hook
  const { isAuthorized, isLoading: isAuthLoading } = useRequireRole(["seller"], {
    loginMessage: "Please log in to access the Seller Dashboard.",
    unauthorizedMessage: "You must activate your seller privileges to view this page.",
    bypassTesting: true, // Bypass checking while in testing/development mode
  });

  // Table Filtering, Sorting, Pagination from URL
  const activeStatus = searchParams.get("status") || "All";
  const sortBy = searchParams.get("sortBy") || "EndDate";
  const tablePage = parseInt(searchParams.get("page") || "1", 10);

  // 1. Fetch ALL seller auctions to calculate overall dashboard summary statistics
  const { data: statsResponse, isLoading: isStatsLoading, refetch: refetchStats } = useGetSellerAuctions({
    page: 1,
    pageSize: 100, // retrieve enough items to compute overall statistics accurately
  });

  // 2. Fetch current page of seller auctions for table display (with filters & sorting applied)
  const { data: tableResponse, isLoading: isTableLoading, refetch: refetchTable } = useGetSellerAuctions({
    page: tablePage,
    pageSize: 5,
    status: activeStatus,
    sortBy: sortBy,
  });

  // Delete Auction Mutation
  const { mutateAsync: deleteAuction, isPending: isDeleting } = useDeleteAuction();

  const handleDeleteAuction = async (id: string) => {
    await deleteAuction(id).catch(() => {});
  };

  // Reset page to 1 when filters change
  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sort);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Guard loading screen (prevent flash of protected content)
  if (isAuthLoading || !isAuthorized) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-semibold">Verifying credentials...</p>
        </div>
      </PageWrapper>
    );
  }


  const allAuctions = statsResponse?.items || [];
  const tableAuctions = tableResponse?.items || [];
  const totalCount = tableResponse?.totalCount || 0;
  const totalPages = tableResponse?.totalPages || 1;

  return (
    <PageWrapper className="py-10 px-4 md:px-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/40 pb-6">
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary shadow-sm">
              <LayoutGrid className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                Seller Dashboard
              </h1>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                Overview of your selling activity
              </p>
            </div>
          </div>

          <Link href={ROUTES.SELLER.CREATE_AUCTION} className="self-start sm:self-auto">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold h-12 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all duration-200">
              <Plus className="h-5 w-5" />
              Create Auction
            </Button>
          </Link>
        </div>

        {/* Section 1: Stats Grid */}
        {isStatsLoading ? (
          <SellerDashboardStatsSkeleton />
        ) : (
          <SellerDashboardStats auctions={allAuctions} />
        )}

        {/* Section 2: Recent Auctions Table */}
        {isTableLoading ? (
          <SellerAuctionsTableSkeleton />
        ) : (
          <SellerAuctionsTable
            auctions={tableAuctions}
            totalCount={totalCount}
            currentPage={tablePage}
            totalPages={totalPages}
            isLoading={isTableLoading}
            activeStatus={activeStatus}
            sortBy={sortBy}
            onStatusChange={handleStatusChange}
            onSortChange={handleSortChange}
            onPageChange={handlePageChange}
            onDeleteAuction={handleDeleteAuction}
            isDeleting={isDeleting}
          />
        )}

      </div>
    </PageWrapper>
  );
}
