import { matchesAuctionTrigger } from "./constants";

export function getTimeString(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export { matchesAuctionTrigger };
