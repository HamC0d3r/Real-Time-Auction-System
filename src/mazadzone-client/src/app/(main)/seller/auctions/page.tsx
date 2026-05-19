"use client";

import { Suspense } from "react";
import { SellerDashboardPage } from "@/features/auctions";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <SellerDashboardPage />
    </Suspense>
  );
}

