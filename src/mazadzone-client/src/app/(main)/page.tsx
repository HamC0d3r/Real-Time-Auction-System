import { PageWrapper } from "@/components/layout/page-wrapper";
import {
  EndingSoonSection,
  HomeHero,
  BrowseCategoriesSection,
  UpcomingAuctionsSection,
} from "@/features/auctions/components/Home-Sections";

export default function Page() {
  return (
    <>
      <HomeHero />
      
      <PageWrapper className="py-0">
        {/* Ending Soon Section */}
        <EndingSoonSection />
      </PageWrapper>

      {/* Browse Categories Section (Full-Bleed background) */}
      <BrowseCategoriesSection />

      <PageWrapper className="py-0">
        {/* Upcoming Auctions Section */}
        <UpcomingAuctionsSection />
      </PageWrapper>
    </>
  );
}
