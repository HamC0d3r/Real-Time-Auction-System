import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AuctionSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function AuctionSearchInput({ value, onChange }: AuctionSearchInputProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search title or description..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 h-14 bg-muted/20 border-input rounded-xl focus-visible:ring-ring/20 text-base"
      />
    </div>
  );
}
