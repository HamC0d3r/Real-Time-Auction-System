"use client";

import { cn } from "@/lib/utils";
import { Notification } from "../types/notification.types";
import {
  Bell,
  Gavel,
  Package,
  MessageSquare,
  Clock,
  Trophy,
  XCircle,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Star,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { parseUtcDate } from "@/utils/date.utils";
import type { NotificationType } from "../types/notification.types";

interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
}

// ---------------------------------------------------------------------------
// Icon map — domain event type → icon + colour ring
// ---------------------------------------------------------------------------

type IconConfig = {
  icon: typeof Bell;
  /** Tailwind classes for the icon container background + text colour. */
  color: string;
};

const ICON_MAP: Record<NotificationType, IconConfig> = {
  // Bidding
  bid_accepted: { icon: Gavel, color: "bg-primary/10 text-primary" },
  bid_placed:   { icon: Gavel, color: "bg-primary/10 text-primary" },
  outbid:       { icon: Gavel, color: "bg-warning text-warning-foreground" },

  // Auctions
  auction_ending:   { icon: Clock,    color: "bg-warning text-warning-foreground" },
  auction_won:      { icon: Trophy,   color: "bg-success text-success-foreground" },
  auction_cancelled:{ icon: XCircle,  color: "bg-destructive/10 text-destructive" },

  // Orders
  order_shipped:  { icon: Package,   color: "bg-info text-info-foreground" },
  order_received: { icon: Package,   color: "bg-success text-success-foreground" },

  // Payments
  payment_failed:     { icon: CreditCard, color: "bg-destructive/10 text-destructive" },
  payment_authorized: { icon: CreditCard, color: "bg-success text-success-foreground" },

  // Disputes
  dispute_opened:   { icon: AlertTriangle, color: "bg-warning text-warning-foreground" },
  dispute_resolved: { icon: CheckCircle2, color: "bg-success text-success-foreground" },

  // Feedback
  feedback_received: { icon: Star, color: "bg-primary/10 text-primary" },

  // Account
  account_verified: { icon: ShieldCheck, color: "bg-success text-success-foreground" },
  seller_approved:  { icon: UserCheck,   color: "bg-success text-success-foreground" },

  // Messaging
  new_message: { icon: MessageSquare, color: "bg-info text-info-foreground" },

  // Fallback
  general: { icon: Bell, color: "bg-muted text-muted-foreground" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const { icon: Icon, color } =
    ICON_MAP[notification.type] ?? ICON_MAP.general;

  const content = (
    <div
      onClick={() => onClick?.(notification)}
      className={cn(
        "flex items-start gap-3.5 px-4 py-3.5 transition-colors cursor-pointer",
        "hover:bg-muted/40 border-b border-border last:border-0",
        !notification.isRead && "bg-primary/[0.03]"
      )}
      role="listitem"
      aria-label={`${notification.title}${!notification.isRead ? " — unread" : ""}`}
    >
      {/* Icon ring */}
      <div
        className={cn(
          "shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5",
          color
        )}
        aria-hidden="true"
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground leading-tight line-clamp-1">
            {notification.title}
          </h4>
          {!notification.isRead && (
            <span
              className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0"
              aria-label="Unread"
            />
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        <span className="text-[11px] text-muted-foreground/70 font-medium">
          {formatDistanceToNow(parseUtcDate(notification.createdAt), {
            addSuffix: true,
          })}
        </span>
      </div>
    </div>
  );

  return content;
}
