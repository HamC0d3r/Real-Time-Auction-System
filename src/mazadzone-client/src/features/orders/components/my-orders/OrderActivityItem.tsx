"use client";

import { useState } from "react";
import { OrderActivity } from "../../types/orders.types";
import { formatCurrency } from "@/utils/currency.utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ROUTES } from "@/config/routes.config";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { format } from "date-fns";
import {
  ActivityListItem,
  ActivityItemImage,
  ActivityItemMeta,
  ActivityItemActions,
} from "@/components/activity-list";
import { DisputeDialog } from "@/features/disputes";

interface OrderActivityItemProps {
  activity: OrderActivity;
}

/**
 * OrderActivityItem Component
 * 
 * A highly specific domain component that maps an OrderActivity record onto the shared `ActivityList` layout.
 * It coordinates order meta information (Final Bid, Order #, and Date), order/shipping statuses,
 * and contextual action buttons (e.g. "Complete Payment" or "View Details") based on order status.
 * 
 * @param activity - The detailed OrderActivity object containing auction, shipping, and order metadata.
 */
export function OrderActivityItem({ activity }: OrderActivityItemProps) {
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const detailHref = ROUTES.ORDERS.DETAIL(activity.id);
  const isPending = activity.status === "Pending";

  return (
    <ActivityListItem className="py-6">
      {/* Column 1: Item Meta Info (55% Width) */}
      <div className="flex items-center gap-6 w-full md:w-[55%] shrink-0">
        <ActivityItemImage
          src={activity.auction.imageUrl}
          alt={activity.auction.title}
          href={detailHref}
          className="w-28 h-28 md:w-32 md:h-32"
        />
        <ActivityItemMeta
          title={activity.auction.title}
          titleHref={detailHref}
          className="gap-1"
          subtitle={
            <div className="flex flex-col gap-1.5 text-sm md:text-base text-gray-500 w-full">
              <div className="flex items-center gap-3 flex-wrap">
                <span>
                  Final Bid: <span className="font-semibold text-primary">{formatCurrency(activity.finalBid)}</span>
                </span>
                <span className="text-gray-300 font-light">|</span>
                <span>
                  Date: <span className="font-medium text-gray-700">{format(new Date(activity.date), "MMM dd, yyyy")}</span>
                </span>
              </div>
              <div>
                Order #: <span className="font-medium text-gray-700">{activity.orderNumber}</span>
              </div>
            </div>
          }
        />
      </div>

      {/* Column 2: Order Status Badge (20% Width) */}
      <div className="flex justify-start md:justify-center items-center w-full md:w-[20%] shrink-0 mt-4 md:mt-0">
        <OrderStatusBadge status={activity.status} />
      </div>

      {/* Column 3: Action Buttons (25% Width) */}
      <ActivityItemActions className="mt-4 md:mt-0 w-full md:w-[25%] shrink-0 flex flex-col sm:flex-row gap-2.5 justify-start md:justify-end md:pr-6">
        <Button
          asChild
          variant={isPending ? "default" : "secondary"}
          className={cn(
            "font-semibold rounded-xl text-lg w-full h-14 cursor-pointer transition-colors",
            isPending
              ? "bg-primary text-white hover:bg-primary/90 md:w-[310px]"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-none md:w-[150px]"
          )}
        >
          <Link href={detailHref}>
            {isPending ? "Complete Payment" : "View Details"}
          </Link>
        </Button>
        {!isPending && (
          <Button
            type="button"
            onClick={() => setIsDisputeOpen(true)}
            variant="secondary"
            className="font-semibold rounded-xl text-lg w-full md:w-[150px] h-14 cursor-pointer bg-warning text-warning-foreground hover:bg-warning/80 border-none transition-colors"
          >
            Open Dispute
          </Button>
        )}

        <DisputeDialog
          isOpen={isDisputeOpen}
          onClose={() => setIsDisputeOpen(false)}
          orderId={activity.id}
          orderNumber={activity.orderNumber}
          itemName={activity.auction.title}
        />
      </ActivityItemActions>
    </ActivityListItem>
  );
}
