"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search, Gavel, FolderOpen, Loader2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ApiResponse } from "@/types/api.types";
import { ROUTES } from "@/config/routes.config";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { formatCurrency } from "@/utils/currency.utils";
import { cn } from "@/lib/utils";

interface SearchUserResult {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface SearchAuctionResult {
  id: string;
  itemTitle: string;
  status: string;
  currentBidAmount: number;
}

interface SearchCategoryResult {
  id: string;
  name: string;
  description: string;
}

interface SearchResultsState {
  users: SearchUserResult[];
  auctions: SearchAuctionResult[];
  categories: SearchCategoryResult[];
}

export interface GlobalHeaderSearchProps {
  containerClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  iconPosition?: "left" | "right";
  placeholder?: string;
  isAdmin?: boolean;
}

export function GlobalHeaderSearch({
  containerClassName = "relative hidden md:block flex-1 max-w-xl mx-6",
  inputClassName = "pl-9 h-10 w-full bg-background/50 border-input hover:border-muted-foreground/30 focus-visible:ring-ring",
  iconClassName = "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
  iconPosition = "left",
  placeholder = "Search...",
  isAdmin = false,
}: GlobalHeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultsState>({ users: [], auctions: [], categories: [] });

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Click outside container listener to close results dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search query fetching
  useEffect(() => {
    if (query.trim().length < 2) return;

    const timer = setTimeout(async () => {
      setIsLoadingSearch(true);
      try {
        const fetches: Promise<unknown>[] = [
          api.get<{ items: SearchAuctionResult[] }>("/auctions", { params: { SearchTerm: query, Page: 1, PageSize: 5 } }),
          api.get<SearchCategoryResult[]>("/categories/search", { params: { SearchTerm: query } }),
        ];

        if (isAdmin) {
          fetches.push(
            api.get<{ items: SearchUserResult[] }>("/users", { params: { SearchTerm: query, PageSize: 5 } })
          );
        }

        const responses = await Promise.allSettled(fetches);

        const auctions = responses[0].status === "fulfilled" ? (responses[0].value as ApiResponse<{ items: SearchAuctionResult[] }>).data?.items || [] : [];
        const categories = responses[1].status === "fulfilled" ? (responses[1].value as ApiResponse<SearchCategoryResult[]>).data || [] : [];
        const users = isAdmin && responses[2] && responses[2].status === "fulfilled" 
          ? (responses[2].value as ApiResponse<{ items: SearchUserResult[] }>).data?.items || [] 
          : [];

        setSearchResults({ users, auctions, categories });
      } catch (err) {
        console.error("Global header search error:", err);
      } finally {
        setIsLoadingSearch(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, isAdmin]);

  const triggerGlobalSearch = () => {
    if (!query.trim()) return;
    setIsFocused(false);
    setQuery("");

    if (isAdmin) {
      router.push(`/admin/auctions?search=${encodeURIComponent(query)}`);
    } else {
      router.push(`${ROUTES.AUCTIONS.LIST}?search=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerGlobalSearch();
    }
  };

  const handleResultClick = (type: "user" | "auction" | "category", item: SearchUserResult | SearchAuctionResult | SearchCategoryResult) => {
    setIsFocused(false);
    setQuery("");

    if (isAdmin) {
      if (type === "user") {
        const user = item as SearchUserResult;
        router.push(`/admin/users?search=${encodeURIComponent(user.fullName)}`);
      } else if (type === "auction") {
        const auction = item as SearchAuctionResult;
        router.push(`/admin/auctions?search=${encodeURIComponent(auction.itemTitle)}`);
      } else {
        router.push("/admin/categories");
      }
    } else {
      if (type === "user") {
        router.push(ROUTES.PROFILE.PUBLIC((item as SearchUserResult).id));
      } else if (type === "auction") {
        router.push(ROUTES.AUCTIONS.DETAIL((item as SearchAuctionResult).id));
      } else {
        router.push(`${ROUTES.AUCTIONS.LIST}?category=${encodeURIComponent((item as SearchCategoryResult).name)}&status=Active`);
      }
    }
  };

  return (
    <div ref={searchContainerRef} className={containerClassName}>
      {iconPosition === "left" && (
        <Search 
          onClick={triggerGlobalSearch} 
          className={cn(iconClassName, "cursor-pointer hover:text-primary transition-colors")} 
        />
      )}
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        className={inputClassName}
      />
      {iconPosition === "right" && (
        <Search 
          onClick={triggerGlobalSearch} 
          className={cn(iconClassName, "cursor-pointer hover:text-primary transition-colors")} 
        />
      )}

      {/* Autocomplete Results Dropdown */}
      {isFocused && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-50 max-h-[480px] overflow-y-auto flex flex-col p-2 gap-2 bg-card/95 backdrop-blur-md animate-fade-in text-foreground">
          {isLoadingSearch ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2 font-semibold">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Searching records...</span>
            </div>
          ) : searchResults.users.length === 0 &&
            searchResults.auctions.length === 0 &&
            searchResults.categories.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground font-semibold">
              No matching records found.
            </div>
          ) : (
            <div className="space-y-4 p-2 text-left">
              {/* Users Section (Admin only) */}
              {isAdmin && searchResults.users.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1 select-none flex items-center gap-1.5 border-b border-border/40 pb-1.5 mb-1">
                    <User className="h-3.5 w-3.5 text-primary" />
                    Moderate Users
                  </div>
                  {searchResults.users.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleResultClick("user", item)}
                      className="w-full flex items-center justify-between text-left p-2 hover:bg-primary/5 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <div className="flex flex-col min-w-0 pr-4">
                        <span className="text-xs font-bold text-foreground truncate">{item.fullName}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{item.email}</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary shrink-0 select-none">
                        {item.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Auctions Section */}
              {searchResults.auctions.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1 select-none flex items-center gap-1.5 border-b border-border/40 pb-1.5 mb-1">
                    <Gavel className="h-3.5 w-3.5 text-primary" />
                    {isAdmin ? "Moderate Auctions" : "Auctions"}
                  </div>
                  {searchResults.auctions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleResultClick("auction", item)}
                      className="w-full flex items-center justify-between text-left p-2 hover:bg-primary/5 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <div className="flex flex-col min-w-0 pr-4">
                        <span className="text-xs font-bold text-foreground truncate">{item.itemTitle}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold truncate capitalize">Status: {item.status}</span>
                      </div>
                      <span className="text-[10px] font-bold text-primary shrink-0">
                        {formatCurrency(item.currentBidAmount)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Categories Section */}
              {searchResults.categories.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1 select-none flex items-center gap-1.5 border-b border-border/40 pb-1.5 mb-1">
                    <FolderOpen className="h-3.5 w-3.5 text-primary" />
                    Categories
                  </div>
                  {searchResults.categories.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleResultClick("category", item)}
                      className="w-full flex flex-col text-left p-2 hover:bg-primary/5 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <span className="text-xs font-bold text-foreground truncate">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate">{item.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
