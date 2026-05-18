"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes.config";
import { Package } from "lucide-react";

/**
 * EmptyOrdersState Component
 * 
 * A specialized presentational layout returned when a user has no won order activities to display.
 * Employs premium design features such as rounded shadows, customized package icons, and a primary CTA
 * that directs users to explore active auctions.
 */
export function EmptyOrdersState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-gray-100 rounded-2xl shadow-sm">
      <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-50/50">
        <Package className="w-12 h-12 text-primary" strokeWidth={1.8} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
      <p className="text-gray-500 max-w-sm mb-8 text-lg leading-relaxed">
        You haven't won any auctions yet. Start bidding to win exciting items!
      </p>
      <Link
        href={ROUTES.AUCTIONS?.LIST || "/auctions"}
        className="px-8 h-14 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center transition-colors shadow-md hover:shadow-lg text-lg cursor-pointer"
      >
        Browse Auctions
      </Link>
    </div>
  );
}
