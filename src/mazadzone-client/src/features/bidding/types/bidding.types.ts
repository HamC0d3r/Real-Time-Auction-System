import { AuctionSummary } from "@/features/auctions";

export type BidStatus = "Leading" | "Outbid" | "Ended";

export interface BidActivity {
  id: string; // usually the bid activity id
  auction: AuctionSummary;
  yourBid: number;
  status: BidStatus;
}

