"use client";

import { useState } from "react";
import { OrderActivity } from "../../types/orders.types";
import { formatCurrency } from "@/utils/currency.utils";
import { Button } from "@/components/ui/button";
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
import { CompletePaymentModal } from "../checkout/CompletePaymentModal";
import { SubmitSellerReviewDialog } from "./SubmitSellerReviewDialog";

interface OrderActivityItemProps {
  activity: OrderActivity;
  onPaymentComplete?: () => void;
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
export function OrderActivityItem({ activity, onPaymentComplete }: OrderActivityItemProps) {
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const detailHref = ROUTES.AUCTIONS.DETAIL(activity.auction.id);
  const isPending = activity.status === "Pending";
  const isDelivered = activity.status === "Delivered";

  return (
    <ActivityListItem className="py-6">
      {/* Column 1: Item Meta Info (55% Width) */}
      <div className="flex items-center gap-6 w-full md:w-[55%] shrink-0">
        <ActivityItemImage
          src={activity.auction.imageUrl}
          alt={activity.auction.title}
          href={detailHref}
          className="w-20 h-20 xs:w-28 xs:h-28 md:w-32 md:h-32"
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
                <span className="hidden sm:inline text-gray-300 font-light">|</span>
                <span>
                  Date: <span className="font-medium text-gray-700">{format(new Date(activity.date), "MMM dd, yyyy")}</span>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {activity.sellerId && activity.sellerName && (
                  <span>
                    Seller:{" "}
                    <Link
                      href={`/users/${activity.sellerId}`}
                      className="font-bold text-gray-700 hover:text-primary transition-colors cursor-pointer"
                    >
                      {activity.sellerName}
                    </Link>
                  </span>
                )}
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
      <ActivityItemActions className="mt-4 md:mt-0 w-full md:w-[25%] shrink-0 flex flex-col gap-2 justify-center items-stretch md:items-end md:pr-6">
        {isPending ? (
          <Button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            variant="default"
            className="font-semibold rounded-xl text-base w-full md:w-[170px] h-11 cursor-pointer transition-colors bg-primary text-white hover:bg-primary/90 flex items-center justify-center"
          >
            Complete Payment
          </Button>
        ) : (
          <div className="flex flex-col gap-2 w-full md:w-[170px]">
            {isDelivered && activity.sellerId && (
              <Button
                type="button"
                onClick={() => setIsReviewOpen(true)}
                variant="default"
                className="font-semibold rounded-xl text-sm w-full h-10 cursor-pointer transition-colors bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center shadow-xs"
              >
                Submit Review
              </Button>
            )}

            <Button
              asChild
              variant="secondary"
              className="font-semibold rounded-xl text-sm w-full h-10 cursor-pointer transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 border-none flex items-center justify-center"
            >
              <Link href={detailHref}>
                View Details
              </Link>
            </Button>

            <Button
              type="button"
              onClick={() => setIsDisputeOpen(true)}
              variant="secondary"
              className="font-semibold rounded-xl text-sm w-full h-10 cursor-pointer bg-warning text-warning-foreground hover:bg-warning/80 border-none transition-colors flex items-center justify-center"
            >
              Open Dispute
            </Button>
          </div>
        )}

        <DisputeDialog
          isOpen={isDisputeOpen}
          onClose={() => setIsDisputeOpen(false)}
          orderId={activity.id}
          orderNumber={activity.orderNumber}
          itemName={activity.auction.title}
        />

        <CompletePaymentModal
          orderId={activity.id}
          orderNumber={activity.orderNumber}
          finalBid={activity.finalBid}
          title={activity.auction.title}
          imageUrl={activity.auction.imageUrl}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={onPaymentComplete}
        />

        {isDelivered && activity.sellerId && (
          <SubmitSellerReviewDialog
            isOpen={isReviewOpen}
            onClose={() => setIsReviewOpen(false)}
            orderId={activity.id}
            orderNumber={activity.orderNumber}
            sellerId={activity.sellerId}
            sellerName={activity.sellerName || "Seller"}
            itemName={activity.auction.title}
          />
        )}
      </ActivityItemActions>
    </ActivityListItem>
  );
}
