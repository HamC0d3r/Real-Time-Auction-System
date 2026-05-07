import Link from "next/link";
import { ROUTES } from "@/config/routes.config";

/**
 * Custom 404 page.
 */
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href={ROUTES.HOME}
        className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Go home
      </Link>
    </div>
  );
}
