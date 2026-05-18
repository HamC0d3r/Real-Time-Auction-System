import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OrderStatus } from "../../types/orders.types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

/**
 * OrderStatusBadge Component
 * 
 * A presentational UI badge that renders color-coded statuses specific to customer orders (e.g., Pending, Shipped, Delivered).
 * Uses harmonized soft background colors and corresponding text colors.
 * 
 * @param status - The order delivery or payment status union type.
 */
export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const isDelivered = status === "Delivered";
  const isShipped = status === "Shipped";
  const isPending = status === "Pending";
  const isCancelled = status === "Cancelled";

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-medium border-none px-4 h-8 text-sm flex items-center justify-center shrink-0",
        isDelivered && "bg-success text-success-foreground",
        isShipped && "bg-info text-info-foreground",
        isPending && "bg-upcoming text-upcoming-foreground",
        isCancelled && "bg-warning text-warning-foreground",
        className
      )}
    >
      {status}
    </Badge>
  );
}
