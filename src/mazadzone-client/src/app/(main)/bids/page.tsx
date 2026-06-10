import { Suspense } from "react";
import { MyBidsPage } from "@/features/bidding/components/my-bids/MyBidsPage";
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
      <MyBidsPage />
    </Suspense>
  );
}
