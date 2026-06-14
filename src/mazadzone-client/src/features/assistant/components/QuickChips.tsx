"use client";

import React from "react";
import { Search, Clock, Gavel, UserPlus, Tag } from "lucide-react";
import { QUICK_CHIPS, type QuickChipItem } from "../constants";

const CHIP_ICONS: Record<string, React.ElementType> = {
  "Browse auctions": Search,
  "Show me electronics ending soon": Clock,
  "How bidding works": Gavel,
  "Become a seller": UserPlus,
  "My bids": Tag,
};

interface QuickChipsProps {
  onChipClick: (label: string) => void;
  visible: boolean;
}

function QuickChip({ chip, onClick }: { chip: QuickChipItem; onClick: (label: string) => void }) {
  const Icon = CHIP_ICONS[chip.label];
  return (
    <button
      onClick={() => onClick(chip.label)}
      className="flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs text-foreground font-medium shadow-xs hover:bg-muted hover:border-muted-foreground/30 transition-all cursor-pointer"
    >
      {Icon && <Icon className="size-3.5 text-muted-foreground" />}
      {chip.text}
    </button>
  );
}

export function QuickChips({ onChipClick, visible }: QuickChipsProps) {
  if (!visible) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2 animate-in fade-in duration-500">
      {QUICK_CHIPS.map((chip) => (
        <QuickChip key={chip.label} chip={chip} onClick={onChipClick} />
      ))}
    </div>
  );
}
