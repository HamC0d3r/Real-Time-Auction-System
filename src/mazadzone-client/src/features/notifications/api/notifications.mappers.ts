/**
 * Pure mapping functions for the Notifications feature.
 * Decouples raw backend DTO models from presentation ViewModels.
 */

import type { Notification, NotificationType } from "../types/notification.types";
import type { NotificationDto } from "./notifications.contracts";
import { parseUtcDate } from "@/utils/date.utils";

/**
 * Maps a backend NotificationDto to a presentation Notification ViewModel.
 * Parses the title and message to dynamically determine event types and deep-link paths.
 */
export function mapNotificationDtoToViewModel(dto: NotificationDto): Notification {
  // Attempt to derive event type from title/message
  let type: NotificationType = "general";
  const titleLower = dto.title.toLowerCase();
  const messageLower = dto.message.toLowerCase();

  if (
    titleLower.includes("shipped") ||
    messageLower.includes("shipped") ||
    titleLower.includes("on the way") ||
    messageLower.includes("on the way") ||
    titleLower.includes("sent") ||
    messageLower.includes("sent") ||
    titleLower.includes("transit") ||
    messageLower.includes("transit")
  ) {
    type = "order_shipped";
  } else if (
    titleLower.includes("received") ||
    titleLower.includes("delivered") ||
    messageLower.includes("received") ||
    messageLower.includes("delivered")
  ) {
    type = "order_received";
  } else if (
    titleLower.includes("bid placed") ||
    titleLower.includes("new bid") ||
    messageLower.includes("bid placed") ||
    messageLower.includes("new bid")
  ) {
    type = "outbid";
  } else if (titleLower.includes("outbid") || messageLower.includes("outbid")) {
    type = "outbid";
  } else if (titleLower.includes("won") || titleLower.includes("win") || messageLower.includes("won") || messageLower.includes("win")) {
    type = "auction_won";
  } else if (titleLower.includes("ending") || titleLower.includes("end") || messageLower.includes("ending")) {
    type = "auction_ending";
  } else if (titleLower.includes("payment failed") || titleLower.includes("failed payment") || messageLower.includes("payment failed")) {
    type = "payment_failed";
  } else if (titleLower.includes("payment") || titleLower.includes("authorized") || messageLower.includes("payment")) {
    type = "payment_authorized";
  } else if (titleLower.includes("dispute") && (titleLower.includes("opened") || messageLower.includes("opened"))) {
    type = "dispute_opened";
  } else if (titleLower.includes("dispute") && (titleLower.includes("resolved") || messageLower.includes("resolved"))) {
    type = "dispute_resolved";
  } else if (titleLower.includes("feedback") || messageLower.includes("feedback")) {
    type = "feedback_received";
  } else if (titleLower.includes("verified") || messageLower.includes("verified")) {
    type = "account_verified";
  } else if (titleLower.includes("approved") || titleLower.includes("become seller") || messageLower.includes("approved")) {
    type = "seller_approved";
  } else if (titleLower.includes("message") || messageLower.includes("message")) {
    type = "new_message";
  } else if (titleLower.includes("cancel") || messageLower.includes("cancel")) {
    type = "auction_cancelled";
  }

  // Derive link (href) dynamically from UUIDs in strings
  let link = "";
  const idRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const match = dto.message.match(idRegex) || dto.title.match(idRegex);
  if (match) {
    const uuid = match[0];
    if (type.startsWith("auction_") || type === "outbid") {
      link = `/auctions/${uuid}`;
    } else if (type.startsWith("order_") || type.startsWith("payment_")) {
      link = `/orders/${uuid}`;
    }
  }

  let resolvedId: string | undefined = undefined;
  if (dto.id) {
    if (typeof dto.id === "object") {
      resolvedId = dto.id.value || (dto.id as Record<string, unknown>)["Value"] as string;
    } else if (typeof dto.id === "string") {
      resolvedId = dto.id;
    }
  }

  return {
    id: resolvedId || Math.random().toString(),
    title: dto.title,
    message: dto.message,
    type,
    createdAt: parseUtcDate(dto.createdOnUtc).toISOString(),
    isRead: dto.isRead,
    link: link || undefined,
  };
}
