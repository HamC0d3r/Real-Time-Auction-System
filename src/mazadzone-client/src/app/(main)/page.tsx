import Link from "next/link";
import { ROUTES } from "@/config/routes.config";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { ClosingSoonSection, HomeHero } from "@/features/auctions";

export default function Page() {
  return (
    <>
      <HomeHero />
      <PageWrapper>
        <div className="space-y-12 pb-16">
          {/* Closing Soon Section */}
          <ClosingSoonSection />
        </div>
      </PageWrapper>
    </>
  );
}
