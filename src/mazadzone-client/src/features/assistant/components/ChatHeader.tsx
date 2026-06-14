"use client";

import React from "react";
import { Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  isArabic: boolean;
  setIsArabic: (val: boolean) => void;
  onMinimize?: () => void;
  onClose: () => void;
}

const LANGUAGES = [
  { key: "ar", label: "عربي", isActive: (isArabic: boolean) => isArabic },
  { key: "en", label: "EN", isActive: (isArabic: boolean) => !isArabic },
] as const;

export function ChatHeader({ isArabic, setIsArabic, onMinimize, onClose }: ChatHeaderProps) {
  return (
    <header className="flex h-[76px] items-center justify-between bg-dark px-4 py-3 text-dark-foreground">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary shadow-inner">
          <svg
            className="size-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-bold tracking-tight text-white leading-tight">
            Mazad Assistant
          </h2>
          <p className="text-xs text-muted-foreground/80 leading-normal">
            Your auction guide
          </p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-400">
              Live auction data
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-xs">
          {LANGUAGES.map((lang, i) => (
            <React.Fragment key={lang.key}>
              {i > 0 && <span className="text-muted-foreground/40">|</span>}
              <button
                onClick={() => setIsArabic(lang.key === "ar")}
                className={`cursor-pointer transition-colors ${
                  lang.isActive(isArabic)
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {lang.label}
              </button>
            </React.Fragment>
          ))}
        </div>

        <span className="ml-1 text-muted-foreground/30">|</span>

        {onMinimize && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onMinimize}
            className="text-muted-foreground hover:bg-white/10 hover:text-white"
            title="Minimize"
          >
            <Minus className="size-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          className="text-muted-foreground hover:bg-white/10 hover:text-white"
          title="Close"
        >
          <X className="size-4" />
        </Button>
      </div>
    </header>
  );
}
