import type { Metadata } from "next";
import { APP_CONFIG } from "@/config/app.config";
import { env } from "@/config/env";

interface PageMetadataOptions {
  title: string;
  description: string;
  /** Path segment for canonical URL (e.g. "/auctions") */
  path?: string;
  /** OpenGraph image URL */
  ogImage?: string;
  /** If true, prevent search engine indexing (e.g. for admin pages) */
  noIndex?: boolean;
}

/**
 * Helper to generate consistent page-level metadata objects.
 *
 * Usage in a `page.tsx` or `layout.tsx`:
 * ```ts
 * export const metadata = createPageMetadata({
 *   title: "Browse Auctions",
 *   description: "Find live auctions on MazadZone",
 *   path: "/auctions",
 * });
 * ```
 */
export function createPageMetadata({
  title,
  description,
  path,
  ogImage,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const fullTitle = `${title} | ${APP_CONFIG.name}`;
  const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const canonicalUrl = path ? `${appUrl}${path}` : undefined;

  return {
    title: fullTitle,
    description,
    ...(noIndex && {
      robots: { index: false, follow: false },
    }),
    openGraph: {
      title: fullTitle,
      description,
      siteName: APP_CONFIG.name,
      type: "website",
      ...(canonicalUrl && { url: canonicalUrl }),
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
    ...(canonicalUrl && {
      alternates: { canonical: canonicalUrl },
    }),
  };
}
