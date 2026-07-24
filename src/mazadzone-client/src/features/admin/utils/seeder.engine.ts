import { faker } from "@faker-js/faker";
import type { AuctionSummary, BidHistoryEntry, Seller } from "@/features/auctions/types/auction.types";
import {
  AUCTION_CATEGORY,
  AUCTION_CONDITION,
  AUCTION_STATUS,
  AUCTION_SUBCATEGORY,
  type AuctionCategory,
  type AuctionSubcategory,
  type AuctionStatus,
} from "@/types/domain.constants";
import type { SeedGenerateOptions, SeedOperationResult, SeedSummaryStats } from "../types/seed.types";

// --- Category Image Assets Mapping -------------------------------

const CATEGORY_IMAGES: Record<AuctionCategory, string[]> = {
  [AUCTION_CATEGORY.TECH_ELECTRONICS]: [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80",
  ],
  [AUCTION_CATEGORY.FASHION_STYLE]: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
  ],
  [AUCTION_CATEGORY.HOME_LIVING]: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80",
  ],
  [AUCTION_CATEGORY.COLLECTIBLES_ART]: [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80",
  ],
  [AUCTION_CATEGORY.HOBBIES_LEISURE]: [
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
  ],
  [AUCTION_CATEGORY.MOTORS]: [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
  ],
};

const CATEGORY_SUBCATEGORY_MAP: Record<AuctionCategory, AuctionSubcategory[]> = {
  [AUCTION_CATEGORY.TECH_ELECTRONICS]: [AUCTION_SUBCATEGORY.LAPTOPS, AUCTION_SUBCATEGORY.SMARTPHONES],
  [AUCTION_CATEGORY.FASHION_STYLE]: [AUCTION_SUBCATEGORY.WATCHES, AUCTION_SUBCATEGORY.SHOES],
  [AUCTION_CATEGORY.HOME_LIVING]: [AUCTION_SUBCATEGORY.FURNITURE],
  [AUCTION_CATEGORY.COLLECTIBLES_ART]: [AUCTION_SUBCATEGORY.PAINTINGS],
  [AUCTION_CATEGORY.HOBBIES_LEISURE]: [AUCTION_SUBCATEGORY.MUSICAL_INSTRUMENTS],
  [AUCTION_CATEGORY.MOTORS]: [AUCTION_SUBCATEGORY.CARS],
};

const MOCK_STORAGE_KEY = "mazadzone_mock_auctions_seed_v1";

export function getStoredMockAuctions(): AuctionSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((item: AuctionSummary) => ({
      ...item,
      timing: {
        ...item.timing,
        startDate: new Date(item.timing.startDate),
        endDate: new Date(item.timing.endDate),
      },
    }));
  } catch (error) {
    console.error("Failed to parse stored mock auctions:", error);
    return [];
  }
}

export function saveStoredMockAuctions(auctions: AuctionSummary[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(auctions));
  } catch (error) {
    console.error("Failed to store mock auctions:", error);
  }
}

function getRandomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function generateMockSeller(): Seller {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const fullName = `${firstName} ${lastName}`;
  return {
    id: `usr_mock_${faker.string.alphanumeric(8)}`,
    fullName,
    email: faker.internet.email({ firstName, lastName }),
    role: "seller",
    avatarInitial: firstName[0].toUpperCase(),
    isVerified: true,
    reviews: faker.number.int({ min: 10, max: 150 }),
    rating: 4.8,
  };
}

export function generateSingleMockAuction(options?: {
  status?: AuctionStatus;
  category?: AuctionCategory;
  activeEndMinutes?: number;
}): AuctionSummary {
  const status = options?.status ?? AUCTION_STATUS.ACTIVE;
  const categoriesList = Object.values(AUCTION_CATEGORY);
  const category = options?.category ?? getRandomItem(categoriesList);
  const subcategory = getRandomItem(CATEGORY_SUBCATEGORY_MAP[category]);

  const imagesList = CATEGORY_IMAGES[category];
  const primaryImage = getRandomItem(imagesList);

  const startingPrice = faker.number.int({ min: 50, max: 1200 });
  const minimumIncrement = Math.max(5, Math.floor(startingPrice * 0.05));

  const now = new Date(); // Sysdate
  let startDate: Date;
  let endDate: Date;

  if (status === AUCTION_STATUS.ACTIVE) {
    // Started 15 minutes ago
    startDate = new Date(now.getTime() - 15 * 60 * 1000);
    // Ends in 15 to 90 minutes (working live timer!)
    const remainingMinutes = options?.activeEndMinutes ?? faker.number.int({ min: 15, max: 90 });
    endDate = new Date(now.getTime() + remainingMinutes * 60 * 1000);
  } else if (status === AUCTION_STATUS.UPCOMING) {
    // Starts in 15 minutes
    startDate = new Date(now.getTime() + 15 * 60 * 1000);
    endDate = new Date(startDate.getTime() + 24 * 3600 * 1000);
  } else {
    // ENDED 30 minutes ago
    endDate = new Date(now.getTime() - 30 * 60 * 1000);
    startDate = new Date(endDate.getTime() - 2 * 3600 * 1000);
  }

  const bidCount = status === AUCTION_STATUS.UPCOMING ? 0 : faker.number.int({ min: 2, max: 8 });
  let currentAmount = startingPrice;
  const bidHistory: BidHistoryEntry[] = [];

  for (let i = 0; i < bidCount; i++) {
    currentAmount += faker.number.int({ min: 10, max: 50 });
    const bidderName = `${faker.person.firstName()} ${faker.person.lastName()[0]}.`;
    bidHistory.unshift({
      id: `bid_${faker.string.alphanumeric(6)}`,
      bidderName,
      bidderInitial: bidderName[0],
      amount: currentAmount,
      timeAgo: `${(i + 1) * 5}m ago`,
      isHighest: i === bidCount - 1,
    });
  }

  const title = `${faker.commerce.productName()} [MOCK]`;

  return {
    id: `auc_mock_${faker.string.alphanumeric(8)}`,
    title,
    imageUrl: primaryImage,
    category,
    subcategory,
    condition: AUCTION_CONDITION.LIKE_NEW,
    status,
    description: "Dynamic sysdate auction seed with live working countdown timer.",
    pricing: {
      startingPrice,
      currentBid: status === AUCTION_STATUS.UPCOMING ? null : currentAmount,
      bidCount,
      minimumIncrement,
    },
    timing: {
      startDate,
      endDate,
      creationDate: startDate.toISOString(),
    },
    isFavorite: false,
    isOwner: false,
    images: [primaryImage],
    bidHistory,
    seller: generateMockSeller(),
  };
}

export function runClientSeeder(options: SeedGenerateOptions): SeedOperationResult {
  const startTime = performance.now();
  const existing = getStoredMockAuctions();

  const count = Math.max(1, Math.min(options.count || 10, 50));
  const generated: AuctionSummary[] = [];

  for (let i = 0; i < count; i++) {
    generated.push(generateSingleMockAuction({
      status: AUCTION_STATUS.ACTIVE,
      activeEndMinutes: (i + 1) * 15,
    }));
  }

  const updated = options.purgeAllFirst ? generated : [...generated, ...existing];
  saveStoredMockAuctions(updated);

  const endTime = performance.now();
  return {
    success: true,
    action: "generate",
    generatedCount: generated.length,
    purgedCount: options.purgeAllFirst ? existing.length : 0,
    executionDurationMs: Math.round(endTime - startTime),
    message: `Generated ${generated.length} sysdate auctions with active live timers.`,
    timestamp: new Date().toLocaleTimeString(),
  };
}

export function runClientPurge(purgeAll: boolean = true): SeedOperationResult {
  const startTime = performance.now();
  const existing = getStoredMockAuctions();
  const purgedCount = existing.length;

  saveStoredMockAuctions([]);

  const endTime = performance.now();
  return {
    success: true,
    action: "purge",
    generatedCount: 0,
    purgedCount,
    executionDurationMs: Math.round(endTime - startTime),
    message: purgeAll
      ? `Purged ALL ${purgedCount} auctions & bids from local storage. Admin accounts preserved.`
      : `Purged ${purgedCount} mock seed auctions.`,
    timestamp: new Date().toLocaleTimeString(),
  };
}

export function getClientSeedStats(): SeedSummaryStats {
  const mockAuctions = getStoredMockAuctions();
  const now = new Date();
  const threeHoursFromNow = new Date(now.getTime() + 3 * 3600 * 1000);

  let activeCount = 0;
  let expiringSoonCount = 0;
  let upcomingCount = 0;
  let endedCount = 0;
  let totalMockBids = 0;

  mockAuctions.forEach((item) => {
    const endDate = new Date(item.timing.endDate);
    const startDate = new Date(item.timing.startDate);

    totalMockBids += item.pricing.bidCount || 0;

    if (startDate <= now && endDate > now) {
      activeCount++;
      if (endDate <= threeHoursFromNow) {
        expiringSoonCount++;
      }
    } else if (startDate > now) {
      upcomingCount++;
    } else {
      endedCount++;
    }
  });

  return {
    totalMockAuctions: mockAuctions.length,
    activeCount,
    expiringSoonCount,
    upcomingCount,
    endedCount,
    totalMockBids,
    lastSeededAt: mockAuctions.length > 0 ? new Date().toLocaleTimeString() : null,
  };
}
