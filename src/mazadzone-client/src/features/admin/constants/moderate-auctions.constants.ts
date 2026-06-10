import type { TableColumn } from "./moderate-users.constants";

export const MODERATE_AUCTION_COLUMNS: TableColumn[] = [
  { key: "auction", label: "Auction" },
  { key: "seller", label: "Seller" },
  { key: "category", label: "Category" },
  { key: "status", label: "Status" },
  { key: "currentBid", label: "Current Price", sortable: true },
  { key: "bidCount", label: "Bid Count", sortable: true },
  { key: "startDate", label: "Start Date", sortable: true },
  { key: "endDate", label: "End Date", sortable: true },
  { key: "actions", label: "Actions", align: "center" },
];

export const AUCTION_PAGE_SIZE_OPTIONS: number[] = [10, 15, 25, 50];

export const AUCTION_CATEGORIES = [
  "All Categories",
  "Tech and Electronics",
  "Fashion and Style",
  "Home and Living",
  "Collectibles and Art",
  "Hobbies and Leisure",
  "Motors",
] as const;

export type AuctionCategory = (typeof AUCTION_CATEGORIES)[number];
