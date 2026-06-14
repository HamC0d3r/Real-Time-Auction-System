import { MessageSquare, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileTabsProps {
  activeTab: "reviews" | "auctions";
  setActiveTab: (tab: "reviews" | "auctions") => void;
  totalReviews: number;
  totalAuctions: number;
}

export function ProfileTabs({
  activeTab,
  setActiveTab,
  totalReviews,
  totalAuctions,
}: ProfileTabsProps) {
  return (
    <div className="flex justify-center gap-4 border-b border-border/60 pb-6">
      <Button
        type="button"
        onClick={() => setActiveTab("reviews")}
        variant={activeTab === "reviews" ? "default" : "outline"}
        className={cn(
          "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer h-auto transition-all duration-300",
          activeTab === "reviews"
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-white border-border hover:bg-muted text-foreground"
        )}
      >
        <MessageSquare className="size-4 shrink-0" />
        <span>Reviews ({totalReviews})</span>
      </Button>

      <Button
        type="button"
        onClick={() => setActiveTab("auctions")}
        variant={activeTab === "auctions" ? "default" : "outline"}
        className={cn(
          "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer h-auto transition-all duration-300",
          activeTab === "auctions"
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-white border-border hover:bg-muted text-foreground"
        )}
      >
        <ShoppingBag className="size-4 shrink-0" />
        <span>Seller Auctions ({totalAuctions})</span>
      </Button>
    </div>
  );
}
