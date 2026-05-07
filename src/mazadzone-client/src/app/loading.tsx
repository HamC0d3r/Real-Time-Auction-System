import { Spinner } from "@/components/status/spinner";

/**
 * Root-level loading state.
 * Shown by Next.js while a route segment is loading.
 */
export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}
