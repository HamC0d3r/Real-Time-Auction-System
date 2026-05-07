export { createHubConnection, startConnection, stopConnection } from "./connection-factory";
export { createBiddingHubClient } from "./bidding-hub.client";
export type {
  BidPlacedEvent,
  AuctionEndedEvent,
  CountdownTickEvent,
  PlaceBidPayload,
  BiddingHubClient,
} from "./bidding-hub.client";
