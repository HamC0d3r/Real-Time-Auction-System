"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { type ReactNode } from "react";
import authImage from "@/assets/Images/Auth.png";
import { ROUTES } from "@/config/routes.config";

interface AuthSplitLayoutProps {
  children: ReactNode;
}

/**
 * AuthSplitLayout
 * A full-page layout that mimics a modal with a split-screen design.
 * The left panel contains branding and an image, while the right panel contains the form.
 */
export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-0 sm:p-4 md:p-8 relative">
      <div className="bg-background w-full max-w-6xl min-h-[100dvh] md:min-h-0 md:h-[730px] sm:rounded-2xl flex flex-col md:flex-row overflow-hidden relative shadow-2xl">

        {/* Close Button (Absolute on Top Right) */}
        <Link
          href={ROUTES.HOME}
          className="absolute top-6 right-6 z-30 text-muted-foreground hover:text-foreground transition-colors bg-background/80 backdrop-blur rounded-full p-1"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </Link>

        {/* Left Panel (Branding) */}
        <div className="hidden md:flex w-72 min-w-14 max-w-72  bg-dark flex flex-col sm:w-full items-center pt-24 px-4  relative overflow-visible flex-shrink-0 ">
          <div className="z-10 relative">
            <h2 className=" text-dark-foreground text-xl font-medium mb-6 mr-0 pr-0">
              Welcome to MAZADZONE!
            </h2>
            <p className="text-dark-foreground text-sm leading-relaxed font-light max-w-xs mx-auto opacity-90 text-center">
              Join today to start bidding on <br /> historical artifacts, luxury items, and unique <br /> collectibles with confidence and ease.
            </p>
          </div>

          <div className="absolute bottom-4 sm:bottom-12 w-[85%] sm:w-[500px] lg:w-[640px] translate-x-[10%] lg:translate-x-[53px] md:translate-x-[0px] z-20 pointer-events-none pb-6">
            <Image

              src={authImage}
              alt="MazadZoon Items"
              width={700}
              height={500}
              className="w-full h-auto object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Right Panel (Form Content) */}
        <div className="flex-1 flex items-center justify-center bg-background   relative overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
