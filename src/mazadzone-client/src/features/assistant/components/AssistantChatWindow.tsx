"use client";

import React, { useState, useRef } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useSendChatMessage } from "../api/assistant.queries";
import { useGetAuctions } from "@/features/auctions";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { FALLBACK_AUCTIONS, WELCOME_MESSAGE, matchesAuctionTrigger } from "../constants";
import { getTimeString } from "../utils";
import type { Message } from "./ChatMessages";
import type { CarouselAuctionItem } from "./MatchedAuctionsCarousel";

interface AssistantChatWindowProps {
  onClose: () => void;
  onMinimize?: () => void;
}

export function AssistantChatWindow({ onClose, onMinimize }: AssistantChatWindowProps) {
  const { isAuthenticated } = useAuthStore();
  const sendChatMutation = useSendChatMessage();
  const sendLockRef = useRef(false);

  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");

  const { data: auctionsData } = useGetAuctions({
    status: "Active",
    pageSize: 50,
  });

  const displayAuctions: CarouselAuctionItem[] =
    auctionsData?.items && auctionsData.items.length > 0
      ? auctionsData.items.map((item) => ({
          id: item.id,
          title: item.title,
          imageUrl: item.imageUrl,
          currentBid: item.pricing.currentBid ?? item.pricing.startingPrice,
          bidCount: item.pricing.bidCount ?? 0,
          endDate: item.timing.endDate,
          timeLeftOrStatus: "Active",
        }))
      : FALLBACK_AUCTIONS;

  const handleSendMessage = (textToSend: string) => {
    const trimmedMessage = textToSend.trim();
    if (!trimmedMessage || !isAuthenticated || sendChatMutation.isPending || sendLockRef.current) return;

    sendLockRef.current = true;

    const timeString = getTimeString();

    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      text: trimmedMessage,
      timestamp: timeString,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    const triggersAuctions = matchesAuctionTrigger(trimmedMessage);

    sendChatMutation.mutate(trimmedMessage, {
      onSuccess: (data) => {
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          text: data.response || "I could not resolve that query.",
          timestamp: getTimeString(),
          showAuctions: triggersAuctions,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      },
      onError: (err: { statusCode?: number; message?: string }) => {
        let errorMsgText = "Sorry, I had trouble reaching the live auction agent right now. Please try again in a bit.";
        if (err?.statusCode === 401) {
          errorMsgText = "Your session has expired. Please sign in again to chat with the assistant.";
        } else if (err?.statusCode && err.statusCode < 500 && err?.message) {
          errorMsgText = `Sorry, I had trouble reaching the live auction agent: ${err.message}`;
        }

        const errMsg: Message = {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: errorMsgText,
          timestamp: getTimeString(),
        };
        setMessages((prev) => [...prev, errMsg]);
      },
      onSettled: () => {
        sendLockRef.current = false;
      },
    });
  };

  return (
    <div className="flex h-[580px] max-h-[calc(100vh-6rem)] w-full max-w-[420px] flex-col overflow-hidden rounded-[16px] border border-border bg-background shadow-2xl animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
      <ChatHeader
        onMinimize={onMinimize}
        onClose={onClose}
      />

      <ChatMessages
        messages={messages}
        isPending={sendChatMutation.isPending}
        isAuthenticated={isAuthenticated}
        onClose={onClose}
        getMatchedAuctionsForMessage={(msgText) => {
          const regex = /(?:^|\n)\s*(?:[\*\-]\s+|\d+\.\s+)?\*\*(.*?)\*\*/g;
          const titles: string[] = [];
          let match;
          while ((match = regex.exec(msgText)) !== null) {
            const title = match[1]?.trim();
            if (title && !title.includes(":") && title.length > 2) {
              titles.push(title);
            }
          }

          if (!titles.length) return [];

          return titles
            .map((title) => {
              const normalizedTitle = title.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
              const match = auctionsData?.items.find((auc) => {
                const normalizedAucTitle = auc.title.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
                return (
                  normalizedAucTitle.includes(normalizedTitle) ||
                  normalizedTitle.includes(normalizedAucTitle)
                );
              });

              if (!match) return null;

              const currentBid = match.pricing.currentBid ?? match.pricing.startingPrice;

              return {
                id: match.id,
                title: match.title,
                imageUrl: match.imageUrl,
                currentBid,
                bidCount: match.pricing.bidCount ?? 0,
                endDate: match.timing.endDate,
                timeLeftOrStatus: match.status.toLowerCase(),
              };
            })
            .filter(Boolean) as CarouselAuctionItem[];
        }}
        displayAuctions={displayAuctions}
      />

      {isAuthenticated && (
        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSubmit={handleSendMessage}
          disabled={sendChatMutation.isPending}
        />
      )}
    </div>
  );
}
