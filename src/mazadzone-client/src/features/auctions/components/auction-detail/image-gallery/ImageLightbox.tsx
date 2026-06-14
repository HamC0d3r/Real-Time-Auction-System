"use client";

import { memo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ThumbnailStrip } from "./ThumbnailStrip";
import { getAuctionImageFallback } from "../../../utils/image.utils";

export interface ImageLightboxProps {
  images: string[];
  title: string;
  initialIndex: number;
  onClose: () => void;
}

function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [active]);
}

export const ImageLightbox = memo(function ImageLightbox({
  images,
  title,
  initialIndex,
  onClose,
}: ImageLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const fallbackImageUrl = getAuctionImageFallback(title, 1200, 900);

  useScrollLock(true);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    },
    [onClose, goNext, goPrev],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/92 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label={`Image viewer — ${title}`}
    >
      <div
        className="relative flex flex-col items-center gap-4 w-full max-w-6xl px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-sm font-semibold text-white/60 tracking-widest uppercase">
            {activeIndex + 1} / {images.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close image viewer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="relative w-full" style={{ height: "70vh" }}>
          {images.length > 1 && (
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="size-6" />
            </button>
          )}

          <Image
            key={images[activeIndex]}
            src={images[activeIndex]}
            alt={`${title} — image ${activeIndex + 1}`}
            fill
            sizes="(max-width: 1280px) 95vw, 1200px"
            className="rounded-xl object-contain animate-in fade-in duration-300"
            onError={(event) => {
              event.currentTarget.src = fallbackImageUrl;
              event.currentTarget.srcset = fallbackImageUrl;
            }}
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="size-6" />
            </button>
          )}
        </div>

        {images.length > 1 && (
          <ThumbnailStrip
            images={images}
            title={title}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            orientation="horizontal"
          />
        )}
      </div>
    </div>
  );
});
