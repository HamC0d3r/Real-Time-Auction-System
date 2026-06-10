"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ViewActionProps {
  href: string;
  className?: string;
}

export function ViewAction({ href, className }: ViewActionProps) {
  return (
    <Link href={href}>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-lg border-border/80 text-muted-foreground hover:text-orange-500 hover:border-orange-500/30 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all cursor-pointer shadow-none",
          className,
        )}
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </Link>
  );
}
