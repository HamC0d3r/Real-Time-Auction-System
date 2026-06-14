"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Tag, Layers, Calendar, Sparkles } from "lucide-react";
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
import { CONDITIONS, STATUSES } from "./auction-filter.constants";
import { useGetCategoryTree } from "../../api";

const FALLBACK_CATEGORIES = Object.values(AuctionCategory);
const FALLBACK_SUBCATEGORIES = Object.values(AuctionSubcategory);

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
    initialFilters.minPrice ?? 0,
    initialFilters.maxPrice ?? 10000,
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
    initialFilters.sortBy || AuctionSortBy.CREATION_DATE,
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialFilters.sortDirection || "asc",
  );

  // Synchronously propagate select / sort filter updates to URL
  const triggerFilterChange = (updates: Partial<AuctionFilters>) => {
    const nextFilters: AuctionFilters = {
      search: search || undefined,
      category: category !== "all" ? (category as AuctionCategory) : undefined,
      subcategory: subcategory !== "all" ? (subcategory as AuctionSubcategory) : undefined,
      condition: condition !== "all" ? (condition as AuctionCondition) : undefined,
      status: status as AuctionStatus,
      minPrice: priceRange[0] !== 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] !== 10000 ? priceRange[1] : undefined,
      sortBy: sortBy as AuctionSortBy,
      sortDirection: sortDirection,
      ...updates,
    };
    lastPushedSearch.current = nextFilters.search;
    lastPushedPriceRange.current = [nextFilters.minPrice ?? 0, nextFilters.maxPrice ?? 10000];
    onFilterChange(nextFilters);
  };

  const initialRenderFilters = useRef(true);
  const lastPushedSearch = useRef<string | undefined>(initialFilters.search);
  const lastPushedPriceRange = useRef<[number, number]>([
    initialFilters.minPrice ?? 0,
    initialFilters.maxPrice ?? 10000,
  ]);

  const { data: categoryTree } = useGetCategoryTree();

  const categoriesList = useMemo(() => {
    if (!categoryTree) return FALLBACK_CATEGORIES;
    return categoryTree.map((c) => c.name);
  }, [categoryTree]);

  const subcategoriesList = useMemo(() => {
    if (!categoryTree) return FALLBACK_SUBCATEGORIES;
    if (category === "all") {
      const allSubs = categoryTree.flatMap((c) => {
        const subs = c.subCategories || c.subcategories || c.children || [];
        return subs.map((sub) => sub.name);
      });
      return Array.from(new Set(allSubs));
    } else {
      const matched = categoryTree.find(
        (c) => c.name.toLowerCase() === category.toLowerCase()
      );
      if (!matched) return [];
      const subs = matched.subCategories || matched.subcategories || matched.children || [];
      return subs.map((sub) => sub.name);
    }
  }, [categoryTree, category]);

  // Sync internal state with initialFilters synchronously
  useEffect(() => {
    if (initialRenderFilters.current) {
      initialRenderFilters.current = false;
      return;
    }
    if (initialFilters.search !== lastPushedSearch.current) {
      setSearch(initialFilters.search || "");
      lastPushedSearch.current = initialFilters.search;
    }
    const nextMin = initialFilters.minPrice ?? 0;
    const nextMax = initialFilters.maxPrice ?? 10000;
    if (nextMin !== lastPushedPriceRange.current[0] || nextMax !== lastPushedPriceRange.current[1]) {
      setPriceRange([nextMin, nextMax]);
      lastPushedPriceRange.current = [nextMin, nextMax];
    }

    let matchedCategory = initialFilters.category || "all";
    let matchedSubcategory = initialFilters.subcategory || "all";

    if (categoryTree && initialFilters.category && (initialFilters.category as string) !== "all") {
      const catNode = categoryTree.find(c => c.name.toLowerCase() === initialFilters.category?.toLowerCase());
      if (catNode) {
        matchedCategory = catNode.name;
        if (initialFilters.subcategory && (initialFilters.subcategory as string) !== "all") {
          const subs = catNode.subCategories || catNode.subcategories || catNode.children || [];
          const subQuery = initialFilters.subcategory.toLowerCase();
          const subNode = subs.find(s => {
            const sName = s.name.toLowerCase();
            return sName === subQuery || sName.includes(subQuery) || subQuery.includes(sName);
          });
          if (subNode) {
            matchedSubcategory = subNode.name;
          }
        }
      }
    }

    setCategory(matchedCategory);
    setSubcategory(matchedSubcategory);
    setCondition(initialFilters.condition || "all");
    setStatus(initialFilters.status || AuctionStatus.ACTIVE);
    setSortBy(initialFilters.sortBy || AuctionSortBy.CREATION_DATE);
    setSortDirection(initialFilters.sortDirection || "asc");
  }, [
    categoryTree,
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

  // Debounce search and price slider changes by 300ms
  useEffect(() => {
    const searchChanged = (search || undefined) !== initialFilters.search;
    const minPriceChanged = (priceRange[0] !== 0 ? priceRange[0] : undefined) !== initialFilters.minPrice;
    const maxPriceChanged = (priceRange[1] !== 10000 ? priceRange[1] : undefined) !== initialFilters.maxPrice;

    if (!searchChanged && !minPriceChanged && !maxPriceChanged) {
      return;
    }

    const handler = setTimeout(() => {
      triggerFilterChange({});
    }, 300);

    return () => clearTimeout(handler);
  }, [search, priceRange]);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSubcategory("all");
    triggerFilterChange({
      category: val !== "all" ? (val as AuctionCategory) : undefined,
      subcategory: undefined,
    });
  };

  const handleSubcategoryChange = (val: string) => {
    setSubcategory(val);
    triggerFilterChange({
      subcategory: val !== "all" ? (val as AuctionSubcategory) : undefined,
    });
  };

  const handleConditionChange = (val: string) => {
    setCondition(val);
    triggerFilterChange({
      condition: val !== "all" ? (val as AuctionCondition) : undefined,
    });
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    triggerFilterChange({
      status: val as AuctionStatus,
    });
  };

  const handleSortByChange = (val: string) => {
    setSortBy(val);
    triggerFilterChange({
      sortBy: val as AuctionSortBy,
    });
  };

  const handleSortDirectionChange = (val: "asc" | "desc") => {
    setSortDirection(val);
    triggerFilterChange({
      sortDirection: val,
    });
  };

  const getStatusStyles = (val: string) => {
    switch (val) {
      case AuctionStatus.ACTIVE:
        return { bg: "bg-green-500/10", icon: "text-green-600", text: "text-green-700" };
      case AuctionStatus.UPCOMING:
        return { bg: "bg-upcoming", icon: "text-upcoming-foreground", text: "text-upcoming-foreground" };
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
          onSortByChange={handleSortByChange}
          sortDirection={sortDirection}
          onSortDirectionChange={handleSortDirectionChange}
        />
      </div>

      {/* Bottom Row: Detailed Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <AuctionSelectFilter
          icon={Tag}
          placeholder="Category"
          value={category}
          onValueChange={handleCategoryChange}
          options={categoriesList}
          allOptionLabel="All Categories"
        />

        <AuctionSelectFilter
          icon={Layers}
          placeholder="Subcategory"
          value={subcategory}
          onValueChange={handleSubcategoryChange}
          options={subcategoriesList}
          allOptionLabel="All Subcategories"
        />

        <AuctionPriceRangeFilter value={priceRange} onChange={setPriceRange} />

        <AuctionSelectFilter
          icon={Sparkles}
          placeholder="Condition"
          value={condition}
          onValueChange={handleConditionChange}
          options={CONDITIONS}
          allOptionLabel="All Conditions"
        />

        <AuctionSelectFilter
          icon={Calendar}
          placeholder="Status"
          value={status}
          onValueChange={handleStatusChange}
          options={STATUSES}
          getStatusStyles={getStatusStyles}
        />
      </div>
    </div>
  );
}
