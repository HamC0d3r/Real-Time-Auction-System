import { useState } from "react";
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
  const [minVal, setMinVal] = useState(value[0].toString());
  const [maxVal, setMaxVal] = useState(value[1].toString());
  const [isFocusedMin, setIsFocusedMin] = useState(false);
  const [isFocusedMax, setIsFocusedMax] = useState(false);

  const displayMinVal = isFocusedMin ? minVal : value[0].toLocaleString();
  const displayMaxVal = isFocusedMax
    ? maxVal
    : value[1] === 10000
      ? "10,000+"
      : value[1].toLocaleString();

  const handleMinFocus = () => {
    setIsFocusedMin(true);
    setMinVal(String(value[0]));
  };

  const handleMaxFocus = () => {
    setIsFocusedMax(true);
    setMaxVal(String(value[1]));
  };

  const handleMinBlur = () => {
    setIsFocusedMin(false);
    const numeric = Number(minVal.replace(/[^0-9]/g, ""));
    const finalVal = isNaN(numeric) ? 0 : Math.max(0, numeric);
    if (finalVal > value[1]) {
      onChange([finalVal, finalVal]);
    } else {
      onChange([finalVal, value[1]]);
    }
  };

  const handleMaxBlur = () => {
    setIsFocusedMax(false);
    const cleanStr = maxVal.replace(/[^0-9+]/g, "");
    const isPlus = cleanStr.includes("+");
    const numeric = Number(cleanStr.replace("+", ""));
    const finalVal = isPlus || numeric >= 10000 || isNaN(numeric) ? 10000 : Math.max(0, numeric);
    if (finalVal < value[0]) {
      onChange([finalVal, finalVal]);
    } else {
      onChange([value[0], finalVal]);
    }
  };

  return (
    <div className="w-full sm:w-auto sm:flex-2 sm:min-w-[300px] flex flex-col gap-3 px-4 py-4 sm:py-0 border-y sm:border-y-0 sm:border-x border-border">
      <div className="flex flex-col gap-0.5 text-center">
        <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">
          Price Range
        </span>
        <span className="text-xs font-bold text-primary">
          Min: {value[0].toLocaleString()} &mdash; Max: {value[1] === 10000 ? `${value[1].toLocaleString()}+` : value[1].toLocaleString()}
        </span>
      </div>
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
              type="text"
              value={displayMinVal}
              onFocus={handleMinFocus}
              onBlur={handleMinBlur}
              onChange={(e) => setMinVal(e.target.value)}
              className="h-9 px-2 text-center border border-input rounded-lg text-sm font-bold text-primary bg-muted/20 w-24 shadow-inner focus-visible:ring-ring/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase">
              Max
            </span>
            <Input
              type="text"
              value={displayMaxVal}
              onFocus={handleMaxFocus}
              onBlur={handleMaxBlur}
              onChange={(e) => setMaxVal(e.target.value)}
              className="h-9 px-2 text-center border border-input rounded-lg text-sm font-bold text-primary bg-muted/20 w-24 shadow-inner focus-visible:ring-ring/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
