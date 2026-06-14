import { create } from "zustand";

export interface ShippingDialogData {
  orderId: string;
  title: string;
}

interface ShippingDialogState {
  isOpen: boolean;
  data: ShippingDialogData | null;
  openShippingDialog: (data: ShippingDialogData) => void;
  closeShippingDialog: () => void;
}

export const useShippingDialogStore = create<ShippingDialogState>()((set) => ({
  isOpen: false,
  data: null,
  openShippingDialog: (data) => set({ isOpen: true, data }),
  closeShippingDialog: () => set({ isOpen: false, data: null }),
}));

/**
 * Reusable utility to trigger the Shipping Dialog from a notification object.
 */
export function triggerShippingDialogFromNotification(notification: { title: string; message: string; link?: string }) {
  const messageText = notification.message || "";
  const titleText = notification.title || "";
  const linkText = notification.link || "";

  // Parse order ID (UUID)
  const idRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const match = linkText.match(idRegex) || messageText.match(idRegex) || titleText.match(idRegex);

  // Clean up title (remove boilerplate text like "Your order is on the way for", "Shipped:", etc.)
  let title = titleText
    .replace(/^Your order is on the way for\s*/i, "")
    .replace(/^Shipped:\s*/i, "")
    .replace(/\.$/, "")
    .trim();

  // Try extracting the item title from the message text
  if (!title || title.toLowerCase().includes("shipped") || title.toLowerCase().includes("way")) {
    const msgMatch = messageText.match(/order for (.*?) has been shipped/i) || messageText.match(/Your order (.*?) is on the way/i);
    if (msgMatch) {
      title = msgMatch[1].trim();
    }
  }

  if (match) {
    const orderId = match[0];
    useShippingDialogStore.getState().openShippingDialog({
      orderId,
      title: title || "Auction Item",
    });
  }
}
