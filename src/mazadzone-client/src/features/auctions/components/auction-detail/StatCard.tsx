import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  className?: string;
}

export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 py-3 text-center transition-colors hover:border-primary/20 hover:bg-card/80",
      className,
    )}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{label}</span>
      <span className="text-lg font-bold text-foreground">{value}</span>
    </div>
  );
}
