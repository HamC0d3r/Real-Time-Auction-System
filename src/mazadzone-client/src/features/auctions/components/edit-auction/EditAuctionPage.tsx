"use client";

import { PageWrapper } from "@/components/layout/page-wrapper";

interface EditAuctionPageProps {
  id: string;
}

/**
 * Placeholder for the Edit Auction Page.
 * This component will handle auction modification logic in the future.
 */
export default function EditAuctionPage({ id }: EditAuctionPageProps) {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Edit Auction: {id}
        </h1>
        <p className="text-lg text-muted-foreground">
          This feature is under development. Soon you will be able to edit your auction details here.
        </p>
      </div>
    </PageWrapper>
  );
}
