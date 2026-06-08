"use client";

import { useEffect, useState } from "react";
import { Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterBar } from "@/components/layout/filter-bar";
import { useGetDisputeTypes } from "../api/disputes.queries";

interface AdminDisputesFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  /** categoryId is the UUID of the selected dispute type, or "All Categories" */
  categoryId: string;
  setCategoryId: (val: string) => void;
  sortColumn: string;
  setSortColumn: (val: string) => void;
}

const DISPUTE_STATUSES = [
  "All Statuses",
  "Open",
  "Under Review",
  "Awaiting Response",
  "Resolved",
  "Rejected",
] as const;

export function AdminDisputesFilters({
  search,
  setSearch,
  status,
  setStatus,
  categoryId,
  setCategoryId,
  sortColumn,
  setSortColumn,
}: AdminDisputesFiltersProps) {
  const { data: disputeTypes = [] } = useGetDisputeTypes();

  // Local search state for debouncing
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        setSearch(localSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, search, setSearch]);

  return (
    <FilterBar
      search={
        <div className="flex flex-col gap-1.5 w-full">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Search</span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/70" />
            <Input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search disputes by ID, order, auction, or user..."
              className="pl-9 h-9 w-full text-xs bg-white text-black border-transparent placeholder:text-black/50 focus-visible:ring-foreground/20 shadow-sm"
            />
          </div>
        </div>
      }
      filters={
        <>
          {/* Dispute Status */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Dispute Status</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-full text-xs rounded-lg cursor-pointer">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="cursor-pointer">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dispute Type (Category) — dynamic from backend */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Dispute Type</span>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
            >
              <SelectTrigger className="h-9 w-full text-xs rounded-lg cursor-pointer">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Categories" className="cursor-pointer">All Types</SelectItem>
                {disputeTypes.map((dt) => (
                  <SelectItem key={dt.id} value={dt.id} className="cursor-pointer">
                    {dt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Sort By</span>
            <Select value={sortColumn} onValueChange={setSortColumn}>
              <SelectTrigger className="h-9 w-full text-xs rounded-lg cursor-pointer">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SubmittedDate" className="cursor-pointer">Submitted Date</SelectItem>
                <SelectItem value="Status" className="cursor-pointer">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      }
    />
  );
}
