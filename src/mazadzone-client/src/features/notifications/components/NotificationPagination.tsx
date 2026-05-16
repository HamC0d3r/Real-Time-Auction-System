import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface NotificationPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const NotificationPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: NotificationPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <Pagination className={cn("py-2 border-t border-gray-100", className)}>
      <PaginationContent className="gap-1">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            className={cn(
              "h-8 w-8 p-0 flex items-center justify-center border-none shadow-none",
              currentPage === 1 && "pointer-events-none opacity-50"
            )}
            text="" // Remove text
          />
        </PaginationItem>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
                isActive={currentPage === page}
                className={cn(
                  "h-8 w-8 p-0 text-xs border-none shadow-none",
                  currentPage === page ? "bg-primary text-white hover:bg-primary/90 hover:text-white" : "hover:bg-gray-100"
                )}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
        </div>

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            className={cn(
              "h-8 w-8 p-0 flex items-center justify-center border-none shadow-none",
              currentPage === totalPages && "pointer-events-none opacity-50"
            )}
            text="" // Remove text
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
