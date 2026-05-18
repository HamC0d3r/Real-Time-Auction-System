"use client";

import { OrderActivity } from "../../types/orders.types";
import { formatCurrency } from "@/utils/currency.utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ROUTES } from "@/config/routes.config";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Package } from "lucide-react";
import { format } from "date-fns";
import {
  ActivityListItem,
  ActivityItemImage,
  ActivityItemMeta,
  ActivityItemActions,
} from "@/components/activity-list";

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
  const detailHref = ROUTES.ORDERS.DETAIL(activity.id);
  const isPending = activity.status === "Pending";

  return (
    <ActivityListItem className="py-6">
      <div className="flex items-center gap-6 w-full md:w-[50%] shrink-0">
        <ActivityItemImage
          src={activity.auction.imageUrl}
          alt={activity.auction.title}
          href={detailHref}
          className="w-28 h-28 md:w-32 md:h-32"
        />
        <ActivityItemMeta
          title={activity.auction.title}
          titleHref={detailHref}
          className="gap-2"
          subtitle={
            <>
              <span>
                Final Bid: <span className="font-semibold text-primary">{formatCurrency(activity.finalBid)}</span>
              </span>
              <span>
                Order #: <span className="font-medium text-gray-700">{activity.orderNumber}</span>
              </span>
              <span>
                Date: <span className="font-medium text-gray-700">{format(new Date(activity.date), "MMM dd, yyyy")}</span>
              </span>
            </>
          }
        />
      </div>

      <div className="flex justify-start md:justify-center items-center gap-6 w-full md:w-auto md:flex-1 mt-4 md:mt-0">
        <OrderStatusBadge status={activity.status} />
        <div className="flex items-center gap-2 text-gray-500 font-medium">
          <Package className="h-5 w-5" />
          <span>{activity.deliveryStatus}</span>
        </div>
      </div>

      <ActivityItemActions className="mt-4 md:mt-0">
        <Button
          asChild
          variant={isPending ? "default" : "secondary"}
          className={cn(
            "font-semibold rounded-xl text-lg w-52 h-14 cursor-pointer transition-colors",
            isPending
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-none"
          )}
        >
          <Link href={detailHref}>
            {isPending ? "Complete Payment" : "View Details"}
          </Link>
        </Button>
      </ActivityItemActions>
    </ActivityListItem>
  );
}
