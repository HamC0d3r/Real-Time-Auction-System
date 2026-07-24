import React from "react";
import { SectionPanel } from "@/components/ui/section-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Play, Trash2, RotateCcw, Clock, Sparkles, Bomb } from "lucide-react";
import type { SeedGenerateOptions } from "../../types/seed.types";

export interface QuickActionPresetsProps {
  onExecutePreset: (options: SeedGenerateOptions) => void;
  onOpenPurgeDialog: (purgeAll: boolean) => void;
  onReset: (options: SeedGenerateOptions) => void;
  isExecuting: boolean;
}

export function QuickActionPresets({
  onExecutePreset,
  onOpenPurgeDialog,
  onReset,
  isExecuting,
}: QuickActionPresetsProps) {
  const handleSysdateRefresh = () => {
    onExecutePreset({
      count: 10,
      preset: "sysdate_live",
      timeOffsets: { activeEndInMinutes: 60 },
      includeBids: true,
      purgeAllFirst: true,
    });
  };

  const handleSeedLiveOnly = () => {
    onExecutePreset({
      count: 10,
      preset: "live_only",
      timeOffsets: { activeEndInMinutes: 45 },
      includeBids: true,
    });
  };

  const handleResetAtomic = () => {
    onReset({
      count: 15,
      preset: "custom",
      statusRatio: { active: 60, upcoming: 20, ended: 20 },
      includeBids: true,
    });
  };

  return (
    <SectionPanel
      title="⚡ Quick Action Presets & Database Purge"
      subtitle="Dynamic sysdate seeding with live working timers and database wipe tools"
      className="mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Preset 1: Sysdate Live Refresh */}
        <div className="flex flex-col justify-between p-4 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Zap className="h-4 w-4" /> Sysdate Live Refresh
              </span>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                Live Timers
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Purges stale data and creates 10 fresh auctions starting now with working countdown timers (+15m to +2h).
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleSysdateRefresh}
            disabled={isExecuting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Sysdate Refresh
          </Button>
        </div>

        {/* Preset 2: Seed Live Only */}
        <div className="flex flex-col justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Play className="h-4 w-4" /> Live Auctions Only
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                Active Bidding
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Generates 10 active auctions open for live bidding with realistic bid histories.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSeedLiveOnly}
            disabled={isExecuting}
            className="w-full border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-semibold gap-1.5"
          >
            <Clock className="h-3.5 w-3.5" />
            Seed Live Only
          </Button>
        </div>

        {/* Preset 3: Reset Atomic */}
        <div className="flex flex-col justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <RotateCcw className="h-4 w-4 text-blue-500" /> Atomic Reset
              </span>
              <Badge variant="outline" className="text-[10px]">
                Purge + Re-seed
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Wipes all existing seed data and re-populates a balanced dataset of 15 auctions.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetAtomic}
            disabled={isExecuting}
            className="w-full text-xs font-semibold gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5 text-blue-500" />
            Full Reset
          </Button>
        </div>

        {/* Preset 4: Delete ALL Database Auctions & Bids */}
        <div className="flex flex-col justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                <Bomb className="h-4 w-4" /> Delete ALL Auctions
              </span>
              <Badge variant="destructive" className="text-[10px]">
                Wipe Auctions
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Deletes ALL auctions & bids (old + mock) from SQL database. Admin users & categories are preserved.
            </p>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onOpenPurgeDialog(true)}
            disabled={isExecuting}
            className="w-full text-xs font-semibold gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Purge Database Data
          </Button>
        </div>
      </div>
    </SectionPanel>
  );
}
