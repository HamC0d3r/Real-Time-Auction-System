"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotificationList } from "./NotificationList";
import { cn } from "@/lib/utils";

interface NotificationPopoverProps {
  unreadCount?: number;
  className?: string;
}

export const NotificationPopover = ({ unreadCount = 0, className }: NotificationPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className={cn("relative flex items-center gap-2 cursor-pointer hover:text-primary transition-colors outline-none", className)}>
          <div className="relative">
            <Bell className="h-7 w-7" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center p-0 rounded-full bg-primary text-white text-[10px] border-none">
                {unreadCount}
              </Badge>
            )}
          </div>
          <span className="hidden lg:inline text-xl font-medium">Notifications</span>
        </div>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-auto bg-transparent border-none shadow-none mt-2">
        <NotificationList />
      </PopoverContent>
    </Popover>
  );
};
