export const auctionsKeys = {
  all: ["admin", "moderate-auctions"] as const,
  list: (filters: unknown) => [...auctionsKeys.all, filters] as const,
};
