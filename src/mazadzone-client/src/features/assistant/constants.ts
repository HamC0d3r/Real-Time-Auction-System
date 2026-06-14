import type { CarouselAuctionItem } from "./components/MatchedAuctionsCarousel";

export const FALLBACK_AUCTIONS: CarouselAuctionItem[] = [
  {
    id: "macbook-air-m2",
    title: "MacBook Air M2 13-inch",
    imageUrl: "",
    currentBid: 420,
    bidCount: 8,
    endDate: new Date(Date.now() + 2 * 3600000 + 10 * 60000).toISOString(),
    timeLeftOrStatus: "Active",
  },
  {
    id: "iphone-14-pro",
    title: "iPhone 14 Pro 128GB",
    imageUrl: "",
    currentBid: 310,
    bidCount: 5,
    endDate: new Date(Date.now() + 1 * 3600000 + 5 * 60000).toISOString(),
    timeLeftOrStatus: "Active",
  },
  {
    id: "sony-wh1000xm4",
    title: "Sony WH-1000XM4 Headphones",
    imageUrl: "",
    currentBid: 95,
    bidCount: 12,
    endDate: new Date(Date.now() + 45 * 60000 + 30000).toISOString(),
    timeLeftOrStatus: "Active",
  },
];

export const AUCTION_TRIGGER_KEYWORDS = [
  "soon",
  "electronics",
  "macbook",
  "iphone",
  "browse",
  "ending",
];

export function matchesAuctionTrigger(text: string): boolean {
  const lower = text.toLowerCase();
  return AUCTION_TRIGGER_KEYWORDS.some((kw) => lower.includes(kw));
}

export const WELCOME_MESSAGE = {
  id: "welcome",
  sender: "assistant" as const,
  text: "Hi, I'm Mazad Assistant. I can help you find auctions, understand bidding, and answer MazadZone questions.",
  timestamp: "10:32 AM",
};

export interface QuickChipItem {
  label: string;
  text: string;
}

export const QUICK_CHIPS: QuickChipItem[] = [
  { label: "Browse auctions", text: "Browse auctions" },
  { label: "Show me electronics ending soon", text: "Ending soon" },
  { label: "How bidding works", text: "How bidding works" },
  { label: "Become a seller", text: "Become a seller" },
  { label: "My bids", text: "My bids" },
];
