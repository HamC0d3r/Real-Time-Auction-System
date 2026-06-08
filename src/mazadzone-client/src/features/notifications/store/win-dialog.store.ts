import { create } from "zustand";
import { fetchMyBids } from "@/features/bidding/api/bidding.api";

export interface WinDialogData {
  auctionId: string;
  title: string;
  bidAmount: number;
}

interface WinDialogState {
  isOpen: boolean;
  data: WinDialogData | null;
  openWinDialog: (data: WinDialogData) => void;
  closeWinDialog: () => void;
}

export const useWinDialogStore = create<WinDialogState>()((set) => ({
  isOpen: false,
  data: null,
  openWinDialog: (data) => set({ isOpen: true, data }),
  closeWinDialog: () => set({ isOpen: false, data: null }),
}));

/**
 * Reusable utility to trigger the Win Celebration Dialog from a notification object.
 */
export function triggerWinDialogFromNotification(notification: { title: string; message: string; link?: string }) {
  const messageText = notification.message || "";
  const titleText = notification.title || "";
  const linkText = notification.link || "";

  // Parse auction ID from link first, fallback to message/title
  const idRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const match = linkText.match(idRegex) || messageText.match(idRegex) || titleText.match(idRegex);

  // Parse bid amount (e.g. from "with a bid of ¤4,235,355.00")
  // We match digits, commas, and dots after "with a bid of"
  const bidRegex = /with a bid of [^\d]*([\d,]+(?:\.\d+)?)/;
  const bidMatch = messageText.match(bidRegex);
  const bidAmount = bidMatch ? parseFloat(bidMatch[1].replace(/,/g, '')) : 0;

  // Clean up title
  let title = titleText
    .replace(/^Congratulations!\s*/i, "")
    .replace(/^You won the auction for\s*/i, "")
    .replace(/\.$/, "")
    .trim();

  // Try extracting the item title from the message text if title is missing/generic
  if (!title || title.toLowerCase().includes("won")) {
    const msgMatch = messageText.match(/You won the auction for (.*?) with a bid of/i);
    if (msgMatch) {
      title = msgMatch[1].trim();
    }
  }

  if (match) {
    const auctionId = match[0];
    useWinDialogStore.getState().openWinDialog({
      auctionId,
      title: title || "Auction Item",
      bidAmount,
    });
    return;
  }

  // Fallback: If no UUID is found but this is an auction won notification,
  // we fetch user's bids and match by title
  const isWinNotification =
    titleText.toLowerCase().includes("won") ||
    titleText.toLowerCase().includes("win") ||
    messageText.toLowerCase().includes("won") ||
    messageText.toLowerCase().includes("win");

  if (isWinNotification && title) {
    fetchMyBids({ filter: "All", pageSize: 50 })
      .then((raw) => {
        const cleanedTarget = title.toLowerCase().replace(/[^a-z0-9]/g, "");
        // Find a bid where the auction title matches our target title
        const matchedBid = raw.items.find((item) => {
          const itemTitle = (item.itemTitle || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          return itemTitle.includes(cleanedTarget) || cleanedTarget.includes(itemTitle);
        });

        if (matchedBid) {
          const auctionId = matchedBid.auctionId;
          if (auctionId) {
            useWinDialogStore.getState().openWinDialog({
              auctionId,
              title: matchedBid.itemTitle || title,
              bidAmount: bidAmount || matchedBid.yourBidAmount || 0,
            });
          }
        } else {
          console.warn("[triggerWinDialogFromNotification] Could not match won auction by title:", title);
        }
      })
      .catch((err) => {
        console.error("[triggerWinDialogFromNotification] Fallback fetchMyBids failed:", err);
      });
  }
}
