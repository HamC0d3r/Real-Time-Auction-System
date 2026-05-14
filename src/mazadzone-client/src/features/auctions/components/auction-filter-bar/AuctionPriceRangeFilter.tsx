import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface AuctionPriceRangeFilterProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function AuctionPriceRangeFilter({
  value,
  onChange,
}: AuctionPriceRangeFilterProps) {
  const handleMinChange = (min: number) => {
    // Ensure min doesn't exceed max
    const newMin = Math.max(0, min);
    if (newMin > value[1]) {
      onChange([newMin, newMin]);
    } else {
      onChange([newMin, value[1]]);
    }
  };

  const handleMaxChange = (max: number) => {
    // Ensure max isn't less than min
    const newMax = Math.max(0, max);
    if (newMax < value[0]) {
      onChange([newMax, newMax]);
    } else {
      onChange([value[0], newMax]);
    }
  };

  return (
    <div className="flex-[2] min-w-[300px] flex flex-col gap-3 px-4 border-x border-border">
      <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60 text-center">
        Current Bid Range
      </span>
      <div className="flex flex-col gap-3">
        <Slider
          min={0}
          max={10000}
          step={50}
          value={value}
          onValueChange={onChange}
          className="w-full"
        />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase">
              Min
            </span>
            <Input
              type="number"
              value={value[0]}
              onChange={(e) => handleMinChange(Number(e.target.value))}
              className="h-9 px-2 text-center border border-input rounded-lg text-sm font-bold text-primary bg-muted/20 w-24 shadow-inner focus-visible:ring-ring/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase">
              Max
            </span>
            <Input
              type="number"
              value={value[1]}
              onChange={(e) => handleMaxChange(Number(e.target.value))}
              className="h-9 px-2 text-center border border-input rounded-lg text-sm font-bold text-primary bg-muted/20 w-24 shadow-inner focus-visible:ring-ring/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
