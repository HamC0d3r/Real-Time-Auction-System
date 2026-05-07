import { useEffect, useState } from "react";

/**
 * Returns `true` once the component has mounted on the client.
 *
 * Use this to guard client-only code (localStorage, window, etc.)
 * and prevent hydration mismatches in SSR/RSC environments.
 *
 * @example
 * ```tsx
 * const isMounted = useMounted();
 * if (!isMounted) return <Skeleton />;
 * return <ClientOnlyWidget />;
 * ```
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
