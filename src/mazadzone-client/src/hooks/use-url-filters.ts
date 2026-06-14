import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useUrlFilters<T extends Record<string, any>>() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilters = useCallback(
    (newFilters: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      // Automatically reset to page 1 if changing filters, unless page is explicitly included
      if (!("page" in newFilters)) {
        params.set("page", "1");
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  return { searchParams, setFilters };
}
