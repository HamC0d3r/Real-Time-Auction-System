import { useEffect, useState } from "react";

/**
 * Debounces a value by the given delay.
 *
 * Commonly used for search inputs to avoid firing API requests
 * on every keystroke.
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebounce(search, 300);
 * // debouncedSearch updates 300ms after the user stops typing
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
