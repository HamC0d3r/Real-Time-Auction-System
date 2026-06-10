import { Suspense } from "react";
import { AuctionsPage } from "@/features/auctions/components/auctions-page";
import { Spinner } from "@/components/ui/spinner";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <AuctionsPage />
    </Suspense>
  );
}
