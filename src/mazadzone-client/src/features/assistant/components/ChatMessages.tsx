"use client";

import React, { useEffect, useRef } from "react";
import { CheckCheck } from "lucide-react";
import { QuickChips } from "./QuickChips";
import { GuestFallback } from "./GuestFallback";
import { MatchedAuctionsCarousel } from "./MatchedAuctionsCarousel";
import type { CarouselAuctionItem } from "./MatchedAuctionsCarousel";

export interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  showAuctions?: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
  isPending: boolean;
  isAuthenticated: boolean;
  onChipClick: (label: string) => void;
  onClose: () => void;
  getMatchedAuctionsForMessage: (text: string) => CarouselAuctionItem[];
  displayAuctions: CarouselAuctionItem[];
}

function cleanMessageText(text: string, matchedItems: CarouselAuctionItem[]): string {
  if (!matchedItems || matchedItems.length === 0) return text;
  
  const lines = text.split("\n");
  let skippingMatchedAuction = false;

  const cleanedLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true; // Keep empty lines for spacing

    // Check if line is an auction title line
    const boldMatch = trimmed.match(/^\s*(?:[\*\-]\s+|\d+\.\s+)?\*\*(.*?)\*\*/);
    if (boldMatch) {
      const boldTitle = boldMatch[1]?.trim();
      if (boldTitle && !boldTitle.includes(":")) {
        const normalizedBold = boldTitle.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
        const isMatchedAuction = matchedItems.some((auc) => {
          const normalizedAuc = auc.title.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
          return normalizedAuc.includes(normalizedBold) || normalizedBold.includes(normalizedAuc);
        });
        if (isMatchedAuction) {
          skippingMatchedAuction = true;
          return false; // Skip the matched auction title
        } else {
          skippingMatchedAuction = false; // We are in an unmatched auction block now
          return true; // Keep the unmatched auction title
        }
      }
    }

    // Check if line is a property line
    const isPropertyLine =
      trimmed.includes("**Current Bid:**") ||
      trimmed.includes("**End Time:**") ||
      trimmed.includes("**Starting Price:**") ||
      trimmed.includes("**Time Left:**") ||
      trimmed.includes("**Current Bid**") ||
      trimmed.includes("**End Time**") ||
      trimmed.includes("**Starting Price**") ||
      trimmed.includes("**Time Left**") ||
      trimmed.includes("**العرض الحالي:**") ||
      trimmed.includes("**تاريخ الانتهاء:**") ||
      trimmed.includes("**سعر البدء:**") ||
      trimmed.includes("**الوقت المتبقي:**") ||
      trimmed.includes("**العرض الحالي**") ||
      trimmed.includes("**تاريخ الانتهاء**") ||
      trimmed.includes("**سعر البدء**") ||
      trimmed.includes("**الوقت المتبقي**");

    if (isPropertyLine) {
      if (skippingMatchedAuction) {
        return false;
      }
      return true; // Keep properties of unmatched auctions
    }

    // Any other text resets the skipping state
    skippingMatchedAuction = false;
    return true;
  });

  return cleanedLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renderCleanText(text: string) {
  const cleaned = text.replace(/\[[+\-?!i*x✓]\]\s*/g, "");
  const parts = cleaned.split("**");
  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <span
              key={index}
              className="inline px-1.5 py-0.5 mx-0.5 font-semibold text-primary bg-primary/10 rounded-[4px] border border-primary/20 text-[13px]"
            >
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}

export function ChatMessages({
  messages,
  isPending,
  isAuthenticated,
  onChipClick,
  onClose,
  getMatchedAuctionsForMessage,
  displayAuctions,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto bg-[#FBF9F6] p-4 space-y-4"
      style={{ scrollBehavior: "smooth" }}
    >
      {messages.map((msg) => {
        const isUser = msg.sender === "user";
        const matched = !isUser ? getMatchedAuctionsForMessage(msg.text) : [];
        const textToDisplay = !isUser ? cleanMessageText(msg.text, matched) : msg.text;

        return (
          <div key={msg.id} className="space-y-3">
            {/* Message Bubble Container */}
            <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`relative max-w-[85%] rounded-[12px] p-3 shadow-xs ${
                  isUser
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-[#FFF9F2] text-foreground border border-[#F4EBE0] rounded-tl-none"
                }`}
              >
                {textToDisplay && (
                  <p className="text-sm font-normal leading-relaxed whitespace-pre-line">
                    {renderCleanText(textToDisplay)}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-end gap-1 text-[9px] opacity-70">
                  <span>{msg.timestamp}</span>
                  {isUser && <CheckCheck className="size-3 text-white/90" />}
                </div>
              </div>
            </div>

            {/* Render matched/legacy recommendations below message */}
            {!isUser && (() => {
              if (matched.length > 0) {
                return (
                  <MatchedAuctionsCarousel items={matched} />
                );
              }

              if (msg.showAuctions) {
                return (
                  <MatchedAuctionsCarousel items={displayAuctions} />
                );
              }

              return null;
            })()}
          </div>
        );
      })}

      {/* AI Answer Processing Loader */}
      {isPending && (
        <div className="flex w-full justify-start animate-pulse">
          <div className="rounded-[12px] bg-[#FFF9F2] p-3 text-sm text-muted-foreground border border-[#F4EBE0] rounded-tl-none flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]"></span>
            <span className="size-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]"></span>
            <span className="size-1.5 rounded-full bg-primary/70 animate-bounce"></span>
          </div>
        </div>
      )}

      {/* Quick suggestions chips */}
      <QuickChips
        onChipClick={onChipClick}
        visible={isAuthenticated && messages.length === 1}
      />

      {/* Guest fallback lock panel */}
      {!isAuthenticated && <GuestFallback onClose={onClose} />}
    </div>
  );
}
