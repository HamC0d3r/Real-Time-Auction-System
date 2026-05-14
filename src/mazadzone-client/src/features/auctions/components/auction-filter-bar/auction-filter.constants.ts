import {
  AuctionCategory,
  AuctionCondition,
  AuctionStatus,
  AuctionSortBy,
  AuctionSubcategory,
} from "../../types/auction.types";

export const CATEGORIES = Object.values(AuctionCategory);
export const CONDITIONS = Object.values(AuctionCondition);
export const STATUSES = Object.values(AuctionStatus);
export const SORT_FIELDS = Object.values(AuctionSortBy);
export const SUBCATEGORIES = Object.values(AuctionSubcategory);

export const CATEGORY_SUBCATEGORY_MAP: Record<string, AuctionSubcategory[]> = {
  [AuctionCategory.TECH_ELECTRONICS]: [
    AuctionSubcategory.LAPTOPS,
    AuctionSubcategory.SMARTPHONES,
    AuctionSubcategory.CAMERAS,
  ],
  [AuctionCategory.FASHION_STYLE]: [
    AuctionSubcategory.WATCHES,
    AuctionSubcategory.SHOES,
    AuctionSubcategory.ACCESSORIES,
  ],
  [AuctionCategory.MOTORS]: [
    AuctionSubcategory.CARS,
    AuctionSubcategory.MOTORCYCLES,
  ],
  [AuctionCategory.HOME_LIVING]: [
    AuctionSubcategory.FURNITURE,
    AuctionSubcategory.DECOR,
  ],
  [AuctionCategory.COLLECTIBLES_ART]: [
    AuctionSubcategory.DECOR, // Fallback or specific if added later
  ],
  [AuctionCategory.HOBBIES_LEISURE]: [
    AuctionSubcategory.ACCESSORIES, // Fallback
  ],
};
