import React, { useState, useEffect, useRef } from "react";
import { Search, Download, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { FilterBar } from "@/components/layout/filter-bar";
import type { UseModerateAuctionsFilters } from "../../api";
import type { AuctionStatus } from "../../types/admin.types";
import { AUCTION_CATEGORIES } from "../../constants/moderate-auctions.constants";

interface ModerateAuctionsFiltersProps {
  filters: UseModerateAuctionsFilters;
  onFilterChange: (newFilters: Partial<UseModerateAuctionsFilters>) => void;
  isExporting: boolean;
  onExport: () => void;
  selectedIds: string[];
}

export function ModerateAuctionsFilters({
  filters,
  onFilterChange,
  isExporting,
  onExport,
  selectedIds,
}: ModerateAuctionsFiltersProps) {
  const hasSelection = selectedIds.length > 0;

  // Local search state for debouncing
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const initialRenderSearch = useRef(true);

  // Keep local search query in sync when search filter changes from elsewhere (e.g. URL query)
  useEffect(() => {
    if (initialRenderSearch.current) {
      initialRenderSearch.current = false;
      return;
    }
    setLocalSearch(filters.search || "");
  }, [filters.search]);

  // Apply search filter after 400ms debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange({ search: localSearch, page: 1 });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [localSearch, filters.search, onFilterChange]);

  return (
    <FilterBar
      search={
        <div className="flex flex-col gap-1.5 w-full">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Search</span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/70" />
            <Input
              type="text"
              placeholder="Search auctions by title, seller, or ID..."
              className="pl-9 h-9 w-full text-xs bg-white text-black border-transparent placeholder:text-black/50 focus-visible:ring-foreground/20 shadow-sm"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>
      }
      filters={
        <>
          {/* Category */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[140px]">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">
              Category
            </span>
            <Select
              value={filters.category || "All Categories"}
              onValueChange={(val) =>
                onFilterChange({ category: val === "All Categories" ? "" : val, page: 1 })
              }
            >
              <SelectTrigger className="cursor-pointer h-9 w-full text-xs rounded-lg">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {AUCTION_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="cursor-pointer">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Auction Status */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[130px]">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">
              Auction Status
            </span>
            <Select
              value={filters.status}
              onValueChange={(val) =>
                onFilterChange({
                  status: val as AuctionStatus | "All Statuses",
                  page: 1,
                })
              }
            >
              <SelectTrigger className="cursor-pointer h-9 w-full text-xs rounded-lg">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Statuses" className="cursor-pointer">
                  All Statuses
                </SelectItem>
                <SelectItem value="Active" className="cursor-pointer">
                  Active
                </SelectItem>
                <SelectItem value="Pending" className="cursor-pointer">
                  Pending
                </SelectItem>
                <SelectItem value="Ended" className="cursor-pointer">
                  Ended
                </SelectItem>
                <SelectItem value="Cancelled" className="cursor-pointer">
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[120px]">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">
              Sort By
            </span>
            <Select
              value={filters.sortBy}
              onValueChange={(val) => onFilterChange({ sortBy: val, page: 1 })}
            >
              <SelectTrigger className="cursor-pointer h-9 w-full text-xs rounded-lg">
                <SelectValue placeholder="Date Created" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateCreated" className="cursor-pointer">
                  Date Created
                </SelectItem>
                <SelectItem value="currentBid" className="cursor-pointer">
                  Current Bid
                </SelectItem>
                <SelectItem value="bidCount" className="cursor-pointer">
                  Bid Count
                </SelectItem>
                <SelectItem value="endDate" className="cursor-pointer">
                  End Date
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Order */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[110px]">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Order</span>
            <Select
              value={filters.sortOrder || "desc"}
              onValueChange={(val) => onFilterChange({ sortOrder: val as "asc" | "desc", page: 1 })}
            >
              <SelectTrigger className="cursor-pointer h-9 w-full text-xs rounded-lg">
                <SelectValue placeholder="Descending" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc" className="cursor-pointer">Descending</SelectItem>
                <SelectItem value="asc" className="cursor-pointer">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Created Date */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[140px]">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">
              Created Date
            </span>
            <Input
              type="date"
              className="h-9 text-xs bg-white text-black border-border"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange({ dateFrom: e.target.value, page: 1 })}
            />
          </div>
        </>
      }
      actions={
        <>
          <Button
            variant="outline"
            className="h-9 px-4 text-xs font-semibold gap-2 border-border shadow-xs"
            onClick={onExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Spinner size="sm" className="text-foreground" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Export
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-9 px-4 text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-colors"
                disabled={!hasSelection}
              >
                Bulk Actions {hasSelection && `(${selectedIds.length})`}
                <ChevronDown className="h-3.5 w-3.5 opacity-80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-card text-foreground border-border"
              sideOffset={5}
            >
              <DropdownMenuItem className="text-xs cursor-pointer" disabled>
                Cancel Selected
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs text-destructive focus:text-destructive cursor-pointer"
                disabled
              >
                Force End Selected
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs font-semibold cursor-pointer"
                onClick={onExport}
              >
                Export Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    />
  );
}
