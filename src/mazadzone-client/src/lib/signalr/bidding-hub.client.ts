import type { HubConnection } from "@microsoft/signalr";
import {
  createHubConnection,
  startConnection,
  stopConnection,
} from "./connection-factory";

// ─── Event Types (server → client) ──────────────────────────────

export interface BidPlacedEvent {
  auctionId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: string;
}

export interface AuctionEndedEvent {
  auctionId: string;
  winnerId: string | null;
  winningBid: number | null;
  endedAt: string;
}

export interface CountdownTickEvent {
  auctionId: string;
  remainingSeconds: number;
}

// ─── Invocation Payloads (client → server) ───────────────────────

export interface PlaceBidPayload {
  auctionId: string;
  amount: number;
}

// ─── Bidding Hub Client ──────────────────────────────────────────

/**
 * Typed client for the Bidding SignalR hub.
 *
 * Usage:
 * ```ts
 * const hub = createBiddingHubClient();
 * await hub.start();
 * hub.onBidPlaced((event) => console.log(event));
 * await hub.joinAuction("auction-123");
 * ```
 */
export function createBiddingHubClient() {
  const connection: HubConnection = createHubConnection("/bidding");

  return {
    /** The underlying SignalR connection (for advanced use) */
    connection,

    // ── Lifecycle ──────────────────────────────────────────
    start: () => startConnection(connection),
    stop: () => stopConnection(connection),

    // ── Subscribe to server events ─────────────────────────
    onBidPlaced: (callback: (event: BidPlacedEvent) => void) => {
      connection.on("BidPlaced", callback);
      return () => connection.off("BidPlaced", callback);
    },

    onAuctionEnded: (callback: (event: AuctionEndedEvent) => void) => {
      connection.on("AuctionEnded", callback);
      return () => connection.off("AuctionEnded", callback);
    },

    onCountdownTick: (callback: (event: CountdownTickEvent) => void) => {
      connection.on("CountdownTick", callback);
      return () => connection.off("CountdownTick", callback);
    },

    // ── Invoke server methods ──────────────────────────────
    placeBid: (payload: PlaceBidPayload) =>
      connection.invoke("PlaceBid", payload),

    joinAuction: (auctionId: string) =>
      connection.invoke("JoinAuction", auctionId),

    leaveAuction: (auctionId: string) =>
      connection.invoke("LeaveAuction", auctionId),
  };
}

export type BiddingHubClient = ReturnType<typeof createBiddingHubClient>;
