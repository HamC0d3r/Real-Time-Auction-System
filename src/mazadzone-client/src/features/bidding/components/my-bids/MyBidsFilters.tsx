"use client";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MyBidsFiltersProps {
  activeFilter: string;
  setActiveFilter: (filter: any) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  filters: readonly string[];
}

export function MyBidsFilters({
  activeFilter,
  setActiveFilter,
  sortBy,
  setSortBy,
  filters,
}: MyBidsFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "rounded-full text-sm font-medium transition-colors w-32 h-12 flex items-center justify-center shrink-0 text-lg cursor-pointer",
              activeFilter === filter
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="w-52">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full h-14 rounded-xl bg-white border-gray-200 text-gray-700 font-medium px-4 cursor-pointer">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-100 shadow-lg">
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
