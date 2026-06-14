export const AUCTION_STATUS = {
  ACTIVE: "Active",
  UPCOMING: "Upcoming",
  ENDED: "Ended",
} as const;

export type AuctionStatus = (typeof AUCTION_STATUS)[keyof typeof AUCTION_STATUS];

export const AUCTION_CATEGORY = {
  TECH_ELECTRONICS: "Tech and Electronics",
  FASHION_STYLE: "Fashion and Style",
  HOME_LIVING: "Home and Living",
  COLLECTIBLES_ART: "Collectibles and Art",
  HOBBIES_LEISURE: "Hobbies and Leisure",
  MOTORS: "Motors",
} as const;

export type AuctionCategory = (typeof AUCTION_CATEGORY)[keyof typeof AUCTION_CATEGORY];

export const AUCTION_SUBCATEGORY = {
  LAPTOPS: "Laptops",
  SMARTPHONES: "Smartphones",
  CAMERAS: "Cameras",
  WATCHES: "Watches",
  SHOES: "Shoes",
  ACCESSORIES: "Accessories",
  CARS: "Cars",
  MOTORCYCLES: "Motorcycles",
  FURNITURE: "Furniture",
  DECOR: "Decor",
  PAINTINGS: "Paintings",
  ANTIQUES: "Antiques",
  SCULPTURES: "Sculptures",
  BOOKS: "Books",
  MUSICAL_INSTRUMENTS: "Musical Instruments",
  SPORTS_EQUIPMENT: "Sports Equipment",
  OTHERS: "Others",
} as const;

export type AuctionSubcategory = (typeof AUCTION_SUBCATEGORY)[keyof typeof AUCTION_SUBCATEGORY];

export const AUCTION_CONDITION = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
} as const;

export type AuctionCondition = (typeof AUCTION_CONDITION)[keyof typeof AUCTION_CONDITION];

export const AUCTION_SORT_BY = {
  CREATION_DATE: "CreationDate",
  START_TIME: "StartTime",
  END_TIME: "EndTime",
  CURRENT_BID_AMOUNT: "CurrentBidAmount",
} as const;

export type AuctionSortBy = (typeof AUCTION_SORT_BY)[keyof typeof AUCTION_SORT_BY];

export const ORDER_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];