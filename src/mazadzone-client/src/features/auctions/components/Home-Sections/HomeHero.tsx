import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { ROUTES } from "@/config/routes.config";
import homeHeroImg from "@/assets/Images/Home.webp";

export function HomeHero() {
  return (
    <section className="relative w-full h-[420px] bg-[#0b101b] overflow-hidden flex items-center">
      {/* Hero Image as Background - Full width section but contained image */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src={homeHeroImg}
          alt="MazadZone Hero"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        {/* Dark gradient overlay behind the text to improve readability (responsive direction) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b101b]/70 via-[#0b101b]/80 to-[#0b101b]/95 md:bg-gradient-to-r md:from-transparent md:via-[#0b101b]/50 md:to-[#0b101b]/95" />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex justify-end">
        <div className="w-full lg:w-5/12 xl:w-[35%] space-y-4">
          <div className="space-y-1">
            <h2 className="text-xs md:text-sm font-bold tracking-widest text-slate-400 uppercase">
              BID. WIN. OWN.
            </h2>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Bid <span className="text-primary">Live</span>. Win Unique Finds.
            </h1>
          </div>

          <p className="text-xs md:text-sm text-slate-200 max-w-sm leading-relaxed">
            Discover rare items, follow real-time auctions, and compete before the countdown ends.
          </p>

          <div className="pt-2">
            <Link
              href={`${ROUTES.AUCTIONS.LIST}?status=Active&sortBy=EndTime`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-base font-bold text-white transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-md shadow-black/20"
            >
              Explore Auctions <MoveRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Soft gradient fade into the page content */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>
  );
}
