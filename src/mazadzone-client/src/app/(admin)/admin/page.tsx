import { Suspense } from "react";
import { AdminDashboardPage } from "@/features/admin";
import { createPageMetadata } from "@/components/seo/metadata";
import { Spinner } from "@/components/ui/spinner";

export const metadata = createPageMetadata({
  title: "Admin Dashboard Overview",
  description: "MazadZone administrative overview, moderation queues, and metrics control panel.",
  path: "/admin",
});

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <AdminDashboardPage />
    </Suspense>
  );
}
