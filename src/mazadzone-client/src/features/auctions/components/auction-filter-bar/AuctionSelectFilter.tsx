import { LucideIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AuctionSelectFilterProps {
  icon: LucideIcon;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  allOptionLabel?: string;
  // Function to determine icon color/bg based on current value
  getStatusStyles?: (value: string) => { bg: string; icon: string; text?: string };
}

export function AuctionSelectFilter({
  icon: Icon,
  placeholder,
  value,
  onValueChange,
  options,
  allOptionLabel,
  getStatusStyles,
}: AuctionSelectFilterProps) {
  const styles = getStatusStyles?.(value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="!w-52 !h-12 bg-card border-input rounded-xl gap-2.5 px-4 shadow-sm hover:border-primary/30 hover:bg-accent/20 transition-all group shrink-0">
        <div
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            styles?.bg || "bg-primary/10 group-hover:bg-primary/20",
          )}
        >
          <Icon className={cn("h-3.5 w-3.5", styles?.icon || "text-primary")} />
        </div>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {allOptionLabel && <SelectItem value="all">{allOptionLabel}</SelectItem>}
        {options.map((opt) => (
          <SelectItem
            key={opt}
            value={opt}
            className={getStatusStyles?.(opt)?.text || ""}
          >
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
