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
    <div className="flex items-center gap-3">
      <div className="flex items-center">
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="!w-52 !h-14 bg-card border-primary/20 hover:border-primary/40 rounded-xl px-4 flex items-center justify-between group transition-all shadow-sm">
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
                {field.replace(/([A-Z])/g, " $1").trim()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <RadioGroup
        value={sortDirection}
        onValueChange={(val) => onSortDirectionChange(val as "asc" | "desc")}
        className="flex items-center h-14 bg-muted/20 border border-input rounded-xl px-1.5 gap-1 w-58 shadow-sm"
      >
        <div className="flex items-center h-full">
          <RadioGroupItem value="asc" id="asc" className="sr-only" />
          <Label
            htmlFor="asc"
            className={cn(
              "flex items-center gap-2 px-3 py-2 cursor-pointer text-xs font-bold uppercase tracking-tight rounded-lg transition-all",
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
              "flex items-center gap-2 px-3 py-2 cursor-pointer text-xs font-bold uppercase tracking-tight rounded-lg transition-all",
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
