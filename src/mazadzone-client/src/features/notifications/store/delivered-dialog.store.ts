import { create } from "zustand";

export interface DeliveredDialogData {
  orderId: string;
  title: string;
}

interface DeliveredDialogState {
  isOpen: boolean;
  isReviewOpen: boolean;
  data: DeliveredDialogData | null;
  openDeliveredDialog: (data: DeliveredDialogData) => void;
  closeDeliveredDialog: () => void;
  openReview: () => void;
  closeReview: () => void;
}

export const useDeliveredDialogStore = create<DeliveredDialogState>()((set) => ({
  isOpen: false,
  isReviewOpen: false,
  data: null,
  openDeliveredDialog: (data) => set({ isOpen: true, isReviewOpen: false, data }),
  closeDeliveredDialog: () => set({ isOpen: false, data: null }),
  openReview: () => set({ isReviewOpen: true, isOpen: false }),
  closeReview: () => set({ isReviewOpen: false, data: null }),
}));

/**
 * Reusable utility to trigger the Delivered Dialog from a notification object.
 */
export function triggerDeliveredDialogFromNotification(notification: { title: string; message: string; link?: string }) {
  const messageText = notification.message || "";
  const titleText = notification.title || "";
  const linkText = notification.link || "";

  // Parse order ID (UUID)
  const idRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const match = linkText.match(idRegex) || messageText.match(idRegex) || titleText.match(idRegex);

  // Clean up title (remove boilerplate text like "Your order is delivered for", "Delivered:", etc.)
  let title = titleText
    .replace(/^Your order has been delivered for\s*/i, "")
    .replace(/^Delivered:\s*/i, "")
    .replace(/\.$/, "")
    .trim();

  // Try extracting the item title from the message text
  if (!title || title.toLowerCase().includes("delivered") || title.toLowerCase().includes("received")) {
    const msgMatch = messageText.match(/order for (.*?) has been delivered/i) || messageText.match(/Your order (.*?) was delivered/i);
    if (msgMatch) {
      title = msgMatch[1].trim();
    }
  }

  if (match) {
    const orderId = match[0];
    useDeliveredDialogStore.getState().openDeliveredDialog({
      orderId,
      title: title || "Auction Item",
    });
  }
}
