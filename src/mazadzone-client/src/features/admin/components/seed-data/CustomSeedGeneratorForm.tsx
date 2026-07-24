import React, { useState } from "react";
import { SectionPanel } from "@/components/ui/section-panel";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import type { SeedGenerateOptions } from "../../types/seed.types";
import { Sliders, Sparkles } from "lucide-react";

export interface CustomSeedGeneratorFormProps {
  onGenerateCustom: (options: SeedGenerateOptions) => void;
  isExecuting: boolean;
}

export function CustomSeedGeneratorForm({
  onGenerateCustom,
  isExecuting,
}: CustomSeedGeneratorFormProps) {
  const [count, setCount] = useState<number>(12);
  const [activeRatio, setActiveRatio] = useState<number>(50);
  const [upcomingRatio, setUpcomingRatio] = useState<number>(25);
  const [endedRatio, setEndedRatio] = useState<number>(25);
  const [activeOffsetHours] = useState<number>(24);

  const handleRatioChange = (type: "active" | "upcoming" | "ended", val: number) => {
    if (type === "active") {
      setActiveRatio(val);
      const remaining = 100 - val;
      setUpcomingRatio(Math.round(remaining / 2));
      setEndedRatio(Math.round(remaining / 2));
    } else if (type === "upcoming") {
      setUpcomingRatio(val);
      setEndedRatio(Math.max(0, 100 - activeRatio - val));
    } else {
      setEndedRatio(val);
      setUpcomingRatio(Math.max(0, 100 - activeRatio - val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateCustom({
      count,
      preset: "custom",
      statusRatio: {
        active: activeRatio,
        upcoming: upcomingRatio,
        ended: endedRatio,
      },
      timeOffsets: {
        activeEndInMinutes: activeOffsetHours * 60,
      },
      includeBids: true,
    });
  };

  return (
    <SectionPanel
      title="⚙️ Custom Seed Generator"
      subtitle="Fine-tune item count and status distribution"
      className="mb-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Count Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-primary" /> Total Auction Seeds to Generate
            </label>
            <Badge variant="secondary" className="font-mono text-xs">
              {count} Auctions
            </Badge>
          </div>
          <Slider
            value={[count]}
            min={1}
            max={50}
            step={1}
            onValueChange={(val) => setCount(val[0])}
            className="py-2"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1 item</span>
            <span>25 items</span>
            <span>50 items</span>
          </div>
        </div>

        {/* Status Ratios */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          <label className="text-xs font-semibold text-foreground block">
            Status Distribution (% Ratio)
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border border-border bg-card space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  🟢 Active (Live)
                </span>
                <span className="font-mono text-xs font-bold">{activeRatio}%</span>
              </div>
              <Slider
                value={[activeRatio]}
                min={0}
                max={100}
                step={5}
                onValueChange={(val) => handleRatioChange("active", val[0])}
              />
              <span className="text-[10px] text-muted-foreground block">
                Ends in ~{activeOffsetHours}h
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-blue-500">🔵 Upcoming</span>
                <span className="font-mono text-xs font-bold">{upcomingRatio}%</span>
              </div>
              <Slider
                value={[upcomingRatio]}
                min={0}
                max={100}
                step={5}
                onValueChange={(val) => handleRatioChange("upcoming", val[0])}
              />
              <span className="text-[10px] text-muted-foreground block">
                Starts in +12h
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-400">⚪ Ended (Past)</span>
                <span className="font-mono text-xs font-bold">{endedRatio}%</span>
              </div>
              <Slider
                value={[endedRatio]}
                min={0}
                max={100}
                step={5}
                onValueChange={(val) => handleRatioChange("ended", val[0])}
              />
              <span className="text-[10px] text-muted-foreground block">
                Includes mock bid history
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 flex justify-end">
          <Button
            type="submit"
            disabled={isExecuting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs px-6 gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isExecuting ? "Generating Seeds..." : `Generate ${count} Auction Seeds`}
          </Button>
        </div>
      </form>
    </SectionPanel>
  );
}
