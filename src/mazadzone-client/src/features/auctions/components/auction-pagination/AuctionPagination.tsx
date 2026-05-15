"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AuctionPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  className?: string;
}

export function AuctionPagination({
  currentPage,
  totalPages,
  onPageChange,
  hasPreviousPage,
  hasNextPage,
  className,
}: AuctionPaginationProps) {
  if (totalPages <= 1) return null;

  const handlePageClick = (page: number) => {
    onPageChange(page);
    // Smooth scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const siblingCount = 2;

    // Logic for generating page numbers with 2 siblings
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // Always include first page
        i === totalPages || // Always include last page
        (i >= currentPage - siblingCount && i <= currentPage + siblingCount) // Include siblings
      ) {
        // Check if we need to add an ellipsis before this number
        if (pages.length > 0) {
          const lastAdded = pages[pages.length - 1];
          if (typeof lastAdded === "number" && i - lastAdded > 1) {
            pages.push("ellipsis");
          }
        }
        pages.push(i);
      }
    }
    
    // De-duplicate if siblings overlap with first/last
    return Array.from(new Set(pages));
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={className}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (hasPreviousPage) handlePageClick(currentPage - 1);
              }}
              className={!hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageClick(page as number);
                  }}
                  className={
                    page === currentPage
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                      : "cursor-pointer"
                  }
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (hasNextPage) handlePageClick(currentPage + 1);
              }}
              className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
