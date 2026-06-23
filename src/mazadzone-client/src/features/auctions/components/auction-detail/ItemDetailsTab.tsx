import { ChevronRight } from "lucide-react";

interface ItemDetailsTabProps {
  category: string;
  subcategory: string;
  description: string;
  condition: string;
  conditionDescription: string;
}

export function ItemDetailsTab({
  category,
  subcategory,
  description,
  condition,
  conditionDescription,
}: ItemDetailsTabProps) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      {/* Tabs Header */}
      <div className="flex border-b border-border mb-6">
        <button className="relative px-4 py-2.5 text-sm font-bold text-foreground transition-colors">
          Item Details
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Category Breadcrumbs */}
        {category && subcategory && !(category === "Tech and Electronics" && subcategory === "Others") && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-1">
            <span>{category}</span>
            <ChevronRight className="size-3 text-muted-foreground/40" />
            <span className="text-primary">{subcategory}</span>
          </div>
        )}

        {/* Description — clean section, no card wrapper */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground">
            Description
          </h2>
          <p className="text-[15px] leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {description}
          </p>
        </div>

        {/* Condition — clean section with inline status pill */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Condition
            </h2>
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary ring-1 ring-primary/20">
              {condition}
            </span>
          </div>
          <p className="text-[15px] leading-relaxed text-foreground/80">
            {conditionDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
