"use client";

export function BidRowsSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-white border border-gray-100 rounded-2xl animate-pulse gap-4"
        >
          <div className="flex items-center gap-4 w-full md:w-[35%] shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-xl shrink-0" />
            <div className="flex flex-col flex-1 gap-2">
              <div className="h-5 bg-gray-200 rounded-md w-3/4" />
              <div className="h-4 bg-gray-200 rounded-md w-1/2" />
            </div>
          </div>
          <div className="flex justify-center w-full md:w-auto md:flex-1">
            <div className="h-8 bg-gray-200 rounded-full w-24" />
          </div>
          <div className="flex justify-center w-full md:w-auto md:flex-1">
            <div className="h-5 bg-gray-200 rounded-md w-28" />
          </div>
          <div className="flex justify-end w-full md:w-auto shrink-0">
            <div className="w-52 h-14 bg-gray-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
