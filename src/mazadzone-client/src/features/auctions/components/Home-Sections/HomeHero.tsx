"use client";

import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { ROUTES } from "@/config/routes.config";
import homeHeroImg from "@/assets/Images/Home.png";

export function HomeHero() {
  return (
    <section className="relative w-full h-[411px] bg-[#0b101b] overflow-hidden flex items-center">
      {/* Hero Image as Background - Full width section but contained image */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src={homeHeroImg}
          alt="MazadZone Hero"
          fill
          className="object-contain object-center"
          priority
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex justify-end">
        <div className="w-full lg:w-1/2 space-y-4">
          <div className="space-y-0.5">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white uppercase">
              BID. WIN. <span className="text-primary font-black">OWN</span>
            </h2>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              The <span className="text-primary italic">Extraordinary</span>
            </h1>
          </div>

          <p className="text-xs md:text-sm text-slate-200 max-w-sm leading-relaxed">
            Access the world's most unique collectibles, rare art, luxury cars,
            fine furniture, and more, all in one place.
          </p>

          <div className="pt-2">
            <Link
              href={ROUTES.AUCTIONS.LIST}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-base font-bold text-white transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-md shadow-black/20"
            >
              Explore Auctions <MoveRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
