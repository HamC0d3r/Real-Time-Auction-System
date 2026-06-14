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
import type { UseModerateUsersFilters } from "../../api";
import type { ModerateUserRole, ModerateUserStatus } from "../../types/admin.types";

interface ModerateUsersFiltersProps {
  filters: UseModerateUsersFilters;
  onFilterChange: (newFilters: Partial<UseModerateUsersFilters>) => void;
  isExporting: boolean;
  onExport: () => void;
  selectedIds: string[];
  onBulkActivate: () => void;
  onBulkSuspend: () => void;
  onBulkBan: () => void;
}

export function ModerateUsersFilters({
  filters,
  onFilterChange,
  isExporting,
  onExport,
  selectedIds,
  onBulkActivate,
  onBulkSuspend,
  onBulkBan
}: ModerateUsersFiltersProps) {
  const hasSelection = selectedIds.length > 0;

  // Local search state for debouncing
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [localJoinedDate, setLocalJoinedDate] = useState(filters.joinedDate || "");
  const initialRenderSearch = useRef(true);
  const initialRenderDate = useRef(true);

  // Keep local inputs in sync when filters change from elsewhere (e.g. URL back/forward)
  useEffect(() => {
    if (initialRenderSearch.current) {
      initialRenderSearch.current = false;
      return;
    }
    setLocalSearch(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    if (initialRenderDate.current) {
      initialRenderDate.current = false;
      return;
    }
    setLocalJoinedDate(filters.joinedDate || "");
  }, [filters.joinedDate]);

  // Apply search filter after 400ms debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange({ search: localSearch, page: 1 });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [localSearch, filters.search, onFilterChange]);

  // Apply joined date filter after 400ms debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (localJoinedDate !== (filters.joinedDate || "")) {
        onFilterChange({ joinedDate: localJoinedDate, page: 1 });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [localJoinedDate, filters.joinedDate, onFilterChange]);

  return (
    <FilterBar
      search={
        <div className="flex flex-col gap-1.5 w-full">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Search</span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/70" />
            <Input
              type="text"
              placeholder="Search users by name or email..."
              className="pl-9 h-9 w-full text-xs bg-white text-black border-transparent placeholder:text-black/50 focus-visible:ring-foreground/20 shadow-sm"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>
      }
      filters={
        <>
          {/* Role */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[120px]">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Role</span>
            <Select
              value={filters.role}
              onValueChange={(val) => onFilterChange({ role: val as ModerateUserRole | "All Roles", page: 1 })}
            >
              <SelectTrigger className="cursor-pointer h-9 w-full text-xs rounded-lg">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Roles" className="cursor-pointer">All Roles</SelectItem>
                <SelectItem value="Bidder" className="cursor-pointer">Bidder</SelectItem>
                <SelectItem value="Seller" className="cursor-pointer">Seller</SelectItem>
                <SelectItem value="Admin" className="cursor-pointer">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account Status */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[130px]">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Account Status</span>
            <Select
              value={filters.status}
              onValueChange={(val) => onFilterChange({ status: val as ModerateUserStatus | "All Statuses", page: 1 })}
            >
              <SelectTrigger className="cursor-pointer h-9 w-full text-xs rounded-lg">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Statuses" className="cursor-pointer">All Statuses</SelectItem>
                <SelectItem value="Active" className="cursor-pointer">Active</SelectItem>
                <SelectItem value="Suspended" className="cursor-pointer">Suspended</SelectItem>
                <SelectItem value="Banned" className="cursor-pointer">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[120px]">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Sort By</span>
            <Select
              value={filters.sortBy}
              onValueChange={(val) => onFilterChange({ sortBy: val, page: 1 })}
            >
              <SelectTrigger className="cursor-pointer h-9 w-full text-xs rounded-lg">
                <SelectValue placeholder="Date Joined" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateJoined" className="cursor-pointer">Date Joined</SelectItem>
                <SelectItem value="name" className="cursor-pointer">Name</SelectItem>
                <SelectItem value="lastActive" className="cursor-pointer">Last Active</SelectItem>
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

          {/* Joined Date */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[140px]">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Joined Date</span>
            <Input
              type="date"
              className="h-9 text-xs bg-white text-black border-border"
              value={localJoinedDate}
              onChange={(e) => setLocalJoinedDate(e.target.value)}
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
            {isExporting ? <Spinner size="sm" className="text-foreground" /> : <Download className="h-3.5 w-3.5" />}
            Export All
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
            <DropdownMenuContent align="end" className="w-48 bg-card text-foreground border-border" sideOffset={5}>
              <DropdownMenuItem className="text-xs cursor-pointer text-success-foreground" onClick={onBulkActivate}>
                Activate Selected
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs cursor-pointer text-muted-foreground" onClick={onBulkSuspend}>
                Suspend Selected
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-destructive focus:text-destructive cursor-pointer" onClick={onBulkBan}>
                Ban Selected
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-semibold cursor-pointer border-t border-border mt-1 pt-1" onClick={onExport}>
                Export Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    />
  );
}

