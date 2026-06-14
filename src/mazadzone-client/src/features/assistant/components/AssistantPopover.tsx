"use client";

import React, { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const AssistantChatWindow = dynamic(
  () => import("./AssistantChatWindow").then((m) => m.AssistantChatWindow),
  { ssr: false }
);

export function AssistantPopover() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-4 font-sans select-none">
      {isOpen && (
        <div className="shadow-2xl animate-in fade-in-0 slide-in-from-bottom-6 zoom-in-95 duration-250">
          <AssistantChatWindow
            onClose={() => setIsOpen(false)}
            onMinimize={() => setIsOpen(false)}
          />
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="size-14 rounded-full shadow-lg hover:scale-105 hover:shadow-xl active:scale-95 active:shadow-md"
        aria-label="Toggle auction guide agent"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="size-6 animate-in spin-in-90 duration-200" />
        ) : (
          <>
            <MessageSquare className="size-6 animate-in zoom-in duration-200" />
            <span className="absolute -right-0.5 -top-0.5 flex size-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
            </span>
          </>
        )}
      </Button>
    </div>
  );
}
