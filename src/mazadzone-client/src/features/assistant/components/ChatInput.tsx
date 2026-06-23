"use client";

import React from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ inputValue, setInputValue, onSubmit, disabled }: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSubmit(inputValue);
    }
  };

  return (
    <div className="border-t border-border bg-white dark:bg-card p-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-[24px] border border-input bg-white dark:bg-muted/30 px-4 py-1.5 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={disabled}
            placeholder="Ask about auctions, bidding, or selling..."
            className="w-full bg-transparent py-1 text-sm font-medium text-foreground outline-hidden placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={disabled || !inputValue.trim()}
          className="flex size-[38px] cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-xs transition-transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground/50"
          aria-label="Send message"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
