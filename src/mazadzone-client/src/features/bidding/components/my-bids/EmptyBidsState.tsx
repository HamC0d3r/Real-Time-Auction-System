"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes.config";

export function EmptyBidsState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-gray-100 rounded-2xl shadow-sm">
      <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0l4.5-4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No Bids Placed Yet</h3>
      <p className="text-gray-500 max-w-md mb-6 text-md">
        You haven't placed any bids on active auctions yet. Discover premium items and place your first bid!
      </p>
      <Link
        href={ROUTES.AUCTIONS?.LIST || "/auctions"}
        className="px-6 h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center transition-colors shadow-md cursor-pointer"
      >
        Explore Auctions
      </Link>
    </div>
  );
}
