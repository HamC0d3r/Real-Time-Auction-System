import { cn } from "@/lib/utils";
import { Notification } from "../types/notification.types";
import { Bell, Gavel, Package, MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
}

const ICON_MAP = {
  bid_accepted: { icon: Gavel, color: "bg-orange-50 text-orange-500" },
  order_shipped: { icon: Package, color: "bg-orange-50 text-orange-500" },
  new_message: { icon: MessageSquare, color: "bg-orange-50 text-orange-500" },
  auction_ending: { icon: Bell, color: "bg-orange-50 text-orange-500" },
  general: { icon: Bell, color: "bg-orange-50 text-orange-500" },
};

export const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  const { icon: Icon, color } = ICON_MAP[notification.type] || ICON_MAP.general;

  return (
    <div
      onClick={() => onClick?.(notification)}
      className={cn(
        "flex items-start gap-4 p-4 transition-colors cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0",
        !notification.isRead && "bg-white"
      )}
    >
      <div className={cn("shrink-0 w-10 h-10 rounded-full flex items-center justify-center", color)}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {notification.title}
          </h4>
          {!notification.isRead && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {notification.message}
        </p>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};
