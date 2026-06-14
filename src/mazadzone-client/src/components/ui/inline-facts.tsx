import { cn } from "@/lib/utils";

export interface FactItem {
  label: string;
  value: string;
  muted?: boolean;
}

export interface InlineFactsProps {
  facts: FactItem[];
  className?: string;
}

export function InlineFacts({ facts, className }: InlineFactsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 divide-x divide-border/60 rounded-xl border border-border/80 bg-card py-3.5 shadow-2xs text-center w-full",
        className,
      )}
    >
      {facts.map((fact) => (
        <div key={fact.label} className="flex flex-col items-center justify-center px-1 xs:px-1.5">
          <span
            className={cn(
              "text-[8px] xs:text-[9px] md:text-[10px] font-extrabold uppercase tracking-wider select-none",
              fact.muted
                ? "text-muted-foreground/45"
                : "text-muted-foreground",
            )}
          >
            {fact.label}
          </span>
          <span
            className={cn(
              "text-xs xs:text-sm sm:text-base md:text-lg font-black mt-1.5 tracking-tight",
              fact.muted
                ? "text-foreground/45"
                : fact.label.toLowerCase().includes("bid") || fact.label.toLowerCase().includes("price")
                  ? "text-primary"
                  : "text-foreground",
            )}
          >
            {fact.value}
          </span>
        </div>
      ))}
    </div>
  );
}
