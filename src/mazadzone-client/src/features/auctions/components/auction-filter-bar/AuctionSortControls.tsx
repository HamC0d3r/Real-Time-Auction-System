import { MoveUp, MoveDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AuctionSortBy } from "../../types/auction.types";
import { SORT_FIELDS } from "./auction-filter.constants";

interface AuctionSortControlsProps {
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortDirection: "asc" | "desc";
  onSortDirectionChange: (value: "asc" | "desc") => void;
}

export function AuctionSortControls({
  sortBy,
  onSortByChange,
  sortDirection,
  onSortDirectionChange,
}: AuctionSortControlsProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
      <div className="flex items-center flex-1 sm:flex-initial">
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="h-14! w-full sm:w-48 flex items-center justify-between shadow-sm hover:bg-accent/20">
            <div className="flex flex-col items-start gap-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-primary/80 mb-0.5">
                Sort By
              </span>
              <SelectValue
                placeholder="Sort By"
                className="text-sm font-semibold text-left text-foreground"
              />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-orange-100">
            {SORT_FIELDS.map((field) => (
              <SelectItem
                key={field}
                value={field}
                className="focus:bg-orange-50 focus:text-orange-900 cursor-pointer py-2.5"
              >
                {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1").trim()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <RadioGroup
        value={sortDirection}
        onValueChange={(val) => onSortDirectionChange(val as "asc" | "desc")}
        className="flex items-center h-14 bg-muted/20 border border-input rounded-xl px-1 sm:px-1.5 gap-0.5 sm:gap-1 w-full max-w-[170px] xs:max-w-[200px] sm:max-w-none sm:w-58 shadow-sm flex-1 sm:flex-initial justify-between"
      >
        <div className="flex items-center h-full">
          <RadioGroupItem value="asc" id="asc" className="sr-only" />
          <Label
            htmlFor="asc"
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer text-[10px] sm:text-xs font-bold uppercase tracking-tight rounded-lg transition-all",
              sortDirection === "asc"
                ? "bg-card text-primary shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:bg-card/50",
            )}
          >
            <div
              className={cn(
                "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all",
                sortDirection === "asc" ? "border-primary bg-primary" : "border-muted-foreground",
              )}
            >
              {sortDirection === "asc" && (
                <div className="w-1 h-1 rounded-full bg-background" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <MoveUp className="h-3.5 w-3.5" />
              <span>Asc</span>
            </div>
          </Label>
        </div>
        <div className="flex items-center h-full">
          <RadioGroupItem value="desc" id="desc" className="sr-only" />
          <Label
            htmlFor="desc"
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer text-[10px] sm:text-xs font-bold uppercase tracking-tight rounded-lg transition-all",
              sortDirection === "desc"
                ? "bg-card text-primary shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:bg-card/50",
            )}
          >
            <div
              className={cn(
                "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all",
                sortDirection === "desc" ? "border-primary bg-primary" : "border-muted-foreground",
              )}
            >
              {sortDirection === "desc" && (
                <div className="w-1 h-1 rounded-full bg-background" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <MoveDown className="h-3.5 w-3.5" />
              <span>Desc</span>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
