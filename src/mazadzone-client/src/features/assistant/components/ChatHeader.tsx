"use client";

import React from "react";
import { Minus, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import chatIcon from "@/assets/Images/ChatIcon.webp";

interface ChatHeaderProps {
  onMinimize?: () => void;
  onClose: () => void;
}

export function ChatHeader({ onMinimize, onClose }: ChatHeaderProps) {
  return (
    <header className="flex h-[76px] items-center justify-between bg-dark px-4 py-3 text-dark-foreground">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full overflow-hidden bg-primary shadow-inner">
          <Image
            src={chatIcon}
            alt="Mazad Assistant"
            width={44}
            height={44}
            className="size-full object-cover"
          />
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
