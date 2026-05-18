"use client";

import { Button } from "@/components/ui/button";

interface ErrorOrdersStateProps {
  onRetry: () => void;
}

/**
 * ErrorOrdersState Component
 * 
 * Rendered when the async orders fetch fails. Provides users with detailed, friendly error notifications 
 * and a tactile trigger action to re-attempt the network request.
 * 
 * @param onRetry - Function fired when the user selects the "Retry Connection" CTA button.
 */
export function ErrorOrdersState({ onRetry }: ErrorOrdersStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-gray-100 rounded-2xl shadow-sm">
      <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
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
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Orders</h3>
      <p className="text-gray-500 max-w-md mb-6 text-md">
        There was an error connecting to the orders service. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="px-6 h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center transition-colors shadow-md cursor-pointer"
      >
        Retry Connection
      </button>
    </div>
  );
}
