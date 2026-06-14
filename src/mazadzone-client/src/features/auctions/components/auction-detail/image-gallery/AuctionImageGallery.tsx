"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { ThumbnailStrip } from "./ThumbnailStrip";
import { ImageLightbox } from "./ImageLightbox";
import { getAuctionImageFallback } from "../../../utils/image.utils";

interface MainImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc: string;
}

function MainImageWithFallback({ src, alt, fallbackSrc }: MainImageWithFallbackProps) {
  const [error, setError] = useState(false);

  return (
    <Image
      src={error || !src ? fallbackSrc : src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 800px"
      className="object-cover transition-all duration-700 ease-out animate-in fade-in zoom-in-95"
      priority
      onError={() => setError(true)}
    />
  );
}

interface AuctionImageGalleryProps {
  images: string[];
  title: string;
}

/**
 * Auction image gallery.
 *
 * Layout:
 * - ThumbnailStrip column on the left (vertical orientation)
 * - Main image on the right — click-to-open lightbox, zoom-in cursor + hint on hover
 *
 * On main image click → opens ImageLightbox (full-screen, object-contain, no cuts).
 */
export function AuctionImageGallery({ images, title }: AuctionImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const allImages = images.length > 0 ? images : ["/placeholder.jpg"];
  const mainImage = allImages[activeIndex];
  const fallbackImageUrl = getAuctionImageFallback(title);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4">
        {/* ── Thumbnail Sidebar ──────────────────────── */}
        {allImages.length > 1 && (
          <ThumbnailStrip
            images={allImages}
            title={title}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            orientation="vertical"
          />
        )}

        {/* ── Main Image — click opens lightbox ─────── */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open full image viewer"
          className="group/main relative flex-1 aspect-square md:h-[639px] overflow-hidden rounded-2xl bg-muted border border-border cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <MainImageWithFallback
            key={mainImage}
            src={mainImage}
            alt={`${title} — image ${activeIndex + 1}`}
            fallbackSrc={fallbackImageUrl}
          />

          {/* Vignette */}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

          {/* Zoom hint overlay — fades in on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/main:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
              <ZoomIn className="size-4" />
              Click to expand
            </div>
          </div>

          {/* Image counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold tracking-widest text-white backdrop-blur-md uppercase pointer-events-none">
              {activeIndex + 1} / {allImages.length}
            </div>
          )}
        </button>
      </div>

      {/* ── Lightbox Modal ─────────────────────────── */}
      {lightboxOpen && (
        <ImageLightbox
          images={allImages}
          title={title}
          initialIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
