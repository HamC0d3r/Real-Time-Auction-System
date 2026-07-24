import React, { useRef, useEffect } from "react";
import { SectionPanel } from "@/components/ui/section-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Terminal, Copy, Trash2, Check } from "lucide-react";
import type { SeedLogEntry } from "../../types/seed.types";
import { toast } from "sonner";

export interface ExecutionConsoleLogProps {
  logs: SeedLogEntry[];
  onClearLogs: () => void;
}

export function ExecutionConsoleLog({ logs, onClearLogs }: ExecutionConsoleLogProps) {
  const consoleBottomRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    consoleBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleCopyLogs = () => {
    if (logs.length === 0) return;
    const formattedText = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}${
            l.durationMs ? ` (${l.durationMs}ms)` : ""
          }`
      )
      .join("\n");

    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    toast.success("Console logs copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelBadge = (level: SeedLogEntry["level"]) => {
    switch (level) {
      case "success":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] uppercase font-mono px-1.5 py-0">SUCCESS</Badge>;
      case "warn":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] uppercase font-mono px-1.5 py-0">WARN</Badge>;
      case "error":
        return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px] uppercase font-mono px-1.5 py-0">ERROR</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] uppercase font-mono px-1.5 py-0">INFO</Badge>;
    }
  };

  return (
    <SectionPanel
      title="💻 Execution Log Console"
      subtitle="Real-time output logs and duration diagnostics for seed operations"
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="h-7 text-[11px] gap-1 px-2.5"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy Log"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="h-7 text-[11px] text-muted-foreground hover:text-foreground gap-1 px-2"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
        </div>
      }
    >
      <div className="bg-dark text-dark-foreground rounded-lg p-4 font-mono text-xs max-h-72 overflow-y-auto shadow-inner border border-border/20 space-y-2">
        {logs.length === 0 ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs py-6 justify-center">
            <Terminal className="h-4 w-4 opacity-50" />
            <span>Console ready. Trigger a quick preset or custom seed generator to view logs.</span>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 leading-relaxed hover:bg-white/5 p-1 rounded transition-colors">
              <span className="text-muted-foreground shrink-0 text-[11px]">{log.timestamp}</span>
              <div className="shrink-0">{getLevelBadge(log.level)}</div>
              <span className="flex-1 text-slate-200 break-all">{log.message}</span>
              {log.durationMs !== undefined && (
                <span className="text-emerald-400 font-bold shrink-0 text-[11px]">
                  +{log.durationMs}ms
                </span>
              )}
            </div>
          ))
        )}
        <div ref={consoleBottomRef} />
      </div>
    </SectionPanel>
  );
}
