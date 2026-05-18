import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BidStatusBadgeProps {
  status: string;
  className?: string;
}

export function BidStatusBadge({ status, className }: BidStatusBadgeProps) {
  const isEnded = status === "Ended";
  const isLeading = status === "Leading";
  const isOutbid = status === "Outbid";

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-medium border-none w-24 h-8 text-lg flex items-center justify-center shrink-0",
        isEnded && "bg-gray-100 text-gray-600",
        isLeading && "bg-success text-success-foreground",
        isOutbid && "bg-warning text-warning-foreground",
        className
      )}
    >
      {status}
    </Badge>
  );
}
