"use client";

import { useState, useEffect } from "react";
import { Tag, Layers, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  AuctionCategory,
  AuctionCondition,
  AuctionStatus,
  AuctionSubcategory,
  AuctionSortBy,
  AuctionFilters,
} from "../../types/auction.types";

import { AuctionSearchInput } from "./AuctionSearchInput";
import { AuctionSortControls } from "./AuctionSortControls";
import { AuctionSelectFilter } from "./AuctionSelectFilter";
import { AuctionPriceRangeFilter } from "./AuctionPriceRangeFilter";
import { CATEGORIES, SUBCATEGORIES, CONDITIONS, STATUSES, CATEGORY_SUBCATEGORY_MAP } from "./auction-filter.constants";

interface AuctionFilterBarProps {
  onFilterChange: (filters: AuctionFilters) => void;
  initialFilters?: AuctionFilters;
  className?: string;
}

export function AuctionFilterBar({
  onFilterChange,
  initialFilters = {},
  className,
}: AuctionFilterBarProps) {
  const [search, setSearch] = useState(initialFilters.search || "");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters.minPrice ?? 20,
    initialFilters.maxPrice ?? 5000,
  ]);
  const [category, setCategory] = useState<string>(initialFilters.category || "all");
  const [subcategory, setSubcategory] = useState<string>(initialFilters.subcategory || "all");
  const [condition, setCondition] = useState<string>(
    initialFilters.condition || "all",
  );
  const [status, setStatus] = useState<string>(
    initialFilters.status || AuctionStatus.ACTIVE,
  );
  const [sortBy, setSortBy] = useState<string>(
    initialFilters.sortBy || AuctionSortBy.PRICE,
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialFilters.sortDirection || "desc",
  );

  // Sync internal state with initialFilters
  useEffect(() => {
    setSearch(initialFilters.search || "");
    setPriceRange([initialFilters.minPrice ?? 20, initialFilters.maxPrice ?? 5000]);
    setCategory(initialFilters.category || "all");
    setSubcategory(initialFilters.subcategory || "all");
    setCondition(initialFilters.condition || "all");
    setStatus(initialFilters.status || AuctionStatus.ACTIVE);
    setSortBy(initialFilters.sortBy || AuctionSortBy.PRICE);
    setSortDirection(initialFilters.sortDirection || "desc");
  }, [
    initialFilters.search,
    initialFilters.minPrice,
    initialFilters.maxPrice,
    initialFilters.category,
    initialFilters.subcategory,
    initialFilters.condition,
    initialFilters.status,
    initialFilters.sortBy,
    initialFilters.sortDirection,
  ]);

  // Debounce search and price slider changes
  useEffect(() => {
    const handler = setTimeout(() => {
      const currentFilters: AuctionFilters = {
        search: search || undefined,
        category: category !== "all" ? (category as AuctionCategory) : undefined,
        subcategory: subcategory !== "all" ? (subcategory as AuctionSubcategory) : undefined,
        condition: condition !== "all" ? (condition as AuctionCondition) : undefined,
        status: status as AuctionStatus,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sortBy: sortBy as AuctionSortBy,
        sortDirection: sortDirection,
      };

      const hasChanged =
        currentFilters.search !== initialFilters.search ||
        currentFilters.category !== initialFilters.category ||
        currentFilters.subcategory !== initialFilters.subcategory ||
        currentFilters.condition !== initialFilters.condition ||
        currentFilters.status !== initialFilters.status ||
        currentFilters.minPrice !== initialFilters.minPrice ||
        currentFilters.maxPrice !== initialFilters.maxPrice ||
        currentFilters.sortBy !== initialFilters.sortBy ||
        currentFilters.sortDirection !== initialFilters.sortDirection;

      if (hasChanged) {
        onFilterChange(currentFilters);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [
    search,
    priceRange,
    category,
    subcategory,
    condition,
    status,
    sortBy,
    sortDirection,
    onFilterChange,
    initialFilters,
  ]);

  // Dependent subcategory options
  const availableSubcategories = category !== "all" 
    ? CATEGORY_SUBCATEGORY_MAP[category] || [] 
    : SUBCATEGORIES;

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSubcategory("all"); // Reset subcategory when category changes
  };

  const getStatusStyles = (val: string) => {
    switch (val) {
      case AuctionStatus.ACTIVE:
        return { bg: "bg-green-500/10", icon: "text-green-600", text: "text-green-700" };
      case AuctionStatus.UPCOMING:
        return { bg: "bg-blue-500/10", icon: "text-blue-600", text: "text-blue-700" };
      case AuctionStatus.ENDED:
        return { bg: "bg-destructive/10", icon: "text-destructive", text: "text-destructive" };
      default:
        return { bg: "bg-primary/10", icon: "text-primary" };
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-6 bg-card p-6 rounded-2xl shadow-sm border border-border w-full",
        className,
      )}
    >
      {/* Top Row: Search and Sort */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <AuctionSearchInput value={search} onChange={setSearch} />
        <AuctionSortControls
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
        />
      </div>

      {/* Bottom Row: Detailed Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <AuctionSelectFilter
          icon={Tag}
          placeholder="Category"
          value={category}
          onValueChange={handleCategoryChange}
          options={CATEGORIES}
          allOptionLabel="All Categories"
        />

        <AuctionSelectFilter
          icon={Layers}
          placeholder="Subcategory"
          value={subcategory}
          onValueChange={setSubcategory}
          options={availableSubcategories}
          allOptionLabel="All Subcategories"
        />

        <AuctionPriceRangeFilter value={priceRange} onChange={setPriceRange} />

        <AuctionSelectFilter
          icon={Sparkles}
          placeholder="Condition"
          value={condition}
          onValueChange={setCondition}
          options={CONDITIONS}
          allOptionLabel="All Conditions"
        />

        <AuctionSelectFilter
          icon={Clock}
          placeholder="Status"
          value={status}
          onValueChange={setStatus}
          options={STATUSES}
          getStatusStyles={getStatusStyles}
        />
      </div>
    </div>
  );
}
