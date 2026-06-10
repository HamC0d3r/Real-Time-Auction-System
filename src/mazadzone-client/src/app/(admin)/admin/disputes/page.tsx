import { Suspense } from "react";
import { Metadata } from "next";
import { AdminDisputesPage } from "@/features/disputes";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Resolve Disputes | MazadZone Admin",
  description: "Review and manage dispute cases across orders and auctions.",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <AdminDisputesPage />
    </Suspense>
  );
}
