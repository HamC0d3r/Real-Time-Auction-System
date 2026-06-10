import { Suspense } from "react";
import { MyOrdersPage } from "@/features/orders";
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
      <MyOrdersPage />
    </Suspense>
  );
}

