import { Suspense } from "react";
import { ModerateAuctionsPage } from "@/features/admin";
import { Spinner } from "@/components/ui/spinner";

export const metadata = {
  title: "Moderate Auctions | MazadZone Admin",
  description: "Review and manage auction listings across the MazadZone platform.",
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
      <ModerateAuctionsPage />
    </Suspense>
  );
}
