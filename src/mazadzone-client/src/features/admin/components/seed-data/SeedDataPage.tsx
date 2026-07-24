"use client";

import React, { useState, useEffect } from "react";
import { SeedStatsOverview } from "./SeedStatsOverview";
import { QuickActionPresets } from "./QuickActionPresets";
import { CustomSeedGeneratorForm } from "./CustomSeedGeneratorForm";
import { ExecutionConsoleLog } from "./ExecutionConsoleLog";
import { ConfirmPurgeDialog } from "./ConfirmPurgeDialog";
import { useSeedStats, useGenerateSeed, usePurgeSeed, useResetSeed } from "../../api/seed";
import type { SeedGenerateOptions, SeedLogEntry } from "../../types/seed.types";
import { Badge } from "@/components/ui/badge";
import { Database, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SeedDataPage() {
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useSeedStats();

  const generateMutation = useGenerateSeed();
  const purgeMutation = usePurgeSeed();
  const resetMutation = useResetSeed();

  const [isPurgeDialogOpen, setIsPurgeDialogOpen] = useState(false);
  const [purgeAllMode, setPurgeAllMode] = useState(true);
  const [logs, setLogs] = useState<SeedLogEntry[]>([]);

  // Initial welcome log
  useEffect(() => {
    setLogs([
      {
        id: "init_1",
        timestamp: new Date().toLocaleTimeString(),
        level: "info",
        message: "Seed Data Management console initialized. Ready for operations.",
      },
    ]);
  }, []);

  const addLog = (level: SeedLogEntry["level"], message: string, durationMs?: number) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        durationMs,
      },
    ]);
  };

  const handleOpenPurgeDialog = (purgeAll: boolean) => {
    setPurgeAllMode(purgeAll);
    setIsPurgeDialogOpen(true);
  };

  const handleExecuteGenerate = (options: SeedGenerateOptions) => {
    addLog("info", `Initiating sysdate seed generation [Preset: ${options.preset || "custom"}, Count: ${options.count}]...`);
    generateMutation.mutate(options, {
      onSuccess: (result) => {
        addLog("success", result.message, result.executionDurationMs);
        refetchStats();
      },
      onError: (err) => {
        addLog("error", `Seed generation failed: ${err.message}`);
      },
    });
  };

  const handleExecuteReset = (options: SeedGenerateOptions) => {
    addLog("warn", "Executing atomic database reset (Purge database auctions + Seed sysdate auctions)...");
    resetMutation.mutate(options, {
      onSuccess: (result) => {
        addLog("success", result.message, result.executionDurationMs);
        refetchStats();
      },
      onError: (err) => {
        addLog("error", `Atomic reset failed: ${err.message}`);
      },
    });
  };

  const handleConfirmPurge = (purgeAll: boolean) => {
    addLog("warn", purgeAll ? "Executing FULL database auctions purge (preserving admin & categories)..." : "Executing mock seeds purge...");
    setIsPurgeDialogOpen(false);
    purgeMutation.mutate(purgeAll, {
      onSuccess: (result) => {
        addLog("success", result.message, result.executionDurationMs);
        refetchStats();
      },
      onError: (err) => {
        addLog("error", `Purge failed: ${err.message}`);
      },
    });
  };

  const isExecuting =
    generateMutation.isPending || purgeMutation.isPending || resetMutation.isPending;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Database className="h-7 w-7 text-primary" />
              Seed Data Management
            </h1>
            <Badge variant="outline" className="text-xs border-primary/40 text-primary font-mono">
              INTERNAL TOOL
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Generate dynamic sysdate auctions with live working timers and manage database auction data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs py-1 px-3 gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Admin & Categories Protected
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchStats()}
            disabled={isStatsLoading}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isStatsLoading ? "animate-spin" : ""}`} />
            Refresh Stats
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <SeedStatsOverview stats={stats} isLoading={isStatsLoading} />

      {/* Quick Action Presets */}
      <QuickActionPresets
        onExecutePreset={handleExecuteGenerate}
        onOpenPurgeDialog={handleOpenPurgeDialog}
        onReset={handleExecuteReset}
        isExecuting={isExecuting}
      />

      {/* Custom Seed Generator */}
      <CustomSeedGeneratorForm
        onGenerateCustom={handleExecuteGenerate}
        isExecuting={isExecuting}
      />

      {/* Live Execution Console Log */}
      <ExecutionConsoleLog logs={logs} onClearLogs={() => setLogs([])} />

      {/* Confirmation Modal */}
      <ConfirmPurgeDialog
        isOpen={isPurgeDialogOpen}
        onClose={() => setIsPurgeDialogOpen(false)}
        onConfirmPurge={handleConfirmPurge}
        isPurging={purgeMutation.isPending}
        totalAuctionCount={stats?.totalMockAuctions ?? 0}
        purgeAllMode={purgeAllMode}
      />
    </div>
  );
}
