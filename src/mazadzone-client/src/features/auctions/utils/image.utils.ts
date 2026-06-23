export function getAuctionImageFallback(
  title: string,
  width: number = 800,
  height: number = 800,
): string {
  return `https://placehold.co/${width}x${height}/F4F1EA/1F2937?text=${encodeURIComponent(title)}`;
}

export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.includes("/uploads/")) {
    const parts = url.split("/uploads/");
    return `/uploads/${parts[1]}`;
  }
  return url;
}
