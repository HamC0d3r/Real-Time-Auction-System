/**
 * Mock auction data for development and testing.
 *
 * Uses @faker-js/faker with a fixed seed (123) for deterministic output.
 * This file should NOT be imported directly by pages or UI components.
 * Instead, consume data through the TanStack Query hooks in `../api/`.
 *
 * @see {@link ../api/auctions.api.ts} for the fetch functions
 * @see {@link ../api/auction.queries.ts} for the TanStack Query hooks
 */

import { faker } from "@faker-js/faker";

import {
  AuctionCategory,
  AuctionCondition,
  AuctionStatus,
} from "../types/auction.types";
import type { AuctionSummary } from "../types/auction.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FAKER_SEED = 123;

const JORDANIAN_LOCATIONS = [
  "Amman",
  "Irbid",
  "Zarqa",
  "Aqaba",
  "Salt",
  "Madaba",
  "Karak",
] as const;

const AUCTION_CATEGORY_VALUES = Object.values(AuctionCategory);
const AUCTION_CONDITION_VALUES = Object.values(AuctionCondition);

/**
 * Realistic product title templates keyed by category.
 * Faker picks adjectives/years/details to keep titles varied but realistic.
 */
const TITLE_TEMPLATES: Record<string, string[]> = {
  [AuctionCategory.TECH_ELECTRONICS]: [
    "iPhone {ver} Pro Max {storage}GB",
    "Samsung Galaxy S{ver} Ultra",
    "MacBook Pro {year} M{ver} Chip",
    "Sony WH-1000XM{ver} Headphones",
    "iPad Air {year} {storage}GB",
    "Dell XPS {ver} Laptop",
    "Apple Watch Series {ver}",
    "PlayStation {ver} Console",
    "Canon EOS R{ver} Camera",
    "DJI Mini {ver} Drone",
    "Nintendo Switch OLED",
    "AirPods Pro {ver}nd Gen",
    "LG OLED C{ver} 55\" TV",
    "Bose QuietComfort {ver}",
    "GoPro Hero {ver} Black",
  ],
  [AuctionCategory.FASHION_STYLE]: [
    "Rolex Submariner {year}",
    "Louis Vuitton Neverfull Bag",
    "Gucci Ace Sneakers Size {size}",
    "Omega Seamaster {year}",
    "Ray-Ban Aviator Classic",
    "Nike Air Jordan {ver} Retro",
    "Cartier Love Bracelet",
    "Hermès Birkin {size}",
    "Tag Heuer Carrera {year}",
    "Chanel Classic Flap Bag",
    "Adidas Yeezy Boost {ver}",
    "Prada Saffiano Wallet",
    "Montblanc Meisterstück Pen",
    "Burberry Trench Coat",
    "Tiffany & Co. Silver Necklace",
  ],
  [AuctionCategory.HOME_LIVING]: [
    "Dyson V{ver} Cordless Vacuum",
    "KitchenAid Artisan Stand Mixer",
    "Nespresso Vertuo Coffee Machine",
    "iRobot Roomba {ver} Series",
    "Philips Hue Starter Kit",
    "Le Creuset Dutch Oven",
    "Handmade Persian Rug {size}x{size}",
    "Herman Miller Aeron Chair",
    "Breville Barista Express",
    "IKEA KALLAX Shelf Unit",
    "Weber Spirit Gas Grill",
    "Vitamix Professional Blender",
    "Tempur-Pedic Mattress Queen",
    "Smeg Retro Fridge",
    "Antique Oak Dining Table",
  ],
  [AuctionCategory.COLLECTIBLES_ART]: [
    "Vintage {year} First Edition Book",
    "Original Oil Painting on Canvas",
    "Rare Pokemon Card Collection",
    "Signed NBA Jersey #{ver}",
    "Limited Edition Vinyl Record",
    "Antique Silver Tea Set {year}",
    "Vintage Leica Camera {year}",
    "Hand-blown Murano Glass Vase",
    "Rare Stamp Collection {year}s",
    "Bronze Sculpture by Local Artist",
    "Vintage World Map {year}",
    "Collector's Edition Board Game",
    "Retro Arcade Machine",
    "Handcrafted Ceramic Pottery Set",
    "Vintage Pocket Watch {year}",
  ],
  [AuctionCategory.HOBBIES_LEISURE]: [
    "Trek Domane Road Bike {year}",
    "Fender Stratocaster Guitar",
    "Callaway Golf Club Set",
    "DJI Phantom {ver} Pro Drone",
    "Camping Tent {ver}-Person Premium",
    "Yamaha Digital Piano P-{ver}",
    "Fishing Rod & Reel Combo Pro",
    "Telescope Celestron NexStar {ver}",
    "LEGO Technic {ver}+ Pieces Set",
    "GoPro Surfing Bundle",
    "Mountain Bike Full Suspension",
    "Tennis Racket Wilson Pro Staff",
    "Scuba Diving Gear Complete Set",
    "Skateboard Tony Hawk Edition",
    "Archery Compound Bow Kit",
  ],
  [AuctionCategory.MOTORS]: [
    "BMW 3 Series {year}",
    "Mercedes-Benz C-Class {year}",
    "Toyota Land Cruiser {year}",
    "Kawasaki Ninja ZX-{ver}R",
    "Honda Civic Type R {year}",
    "Jeep Wrangler Rubicon {year}",
    "Harley-Davidson Sportster {year}",
    "Audi A{ver} Quattro {year}",
    "Ford Mustang GT {year}",
    "Yamaha YZF-R{ver}",
    "Range Rover Sport {year}",
    "Porsche 911 Carrera {year}",
    "Nissan Patrol {year}",
    "Ducati Panigale V{ver}",
    "Kia Sportage {year}",
  ],
};

// ---------------------------------------------------------------------------
// Title Generator
// ---------------------------------------------------------------------------

function generateTitle(category: string): string {
  const templates = TITLE_TEMPLATES[category] ?? TITLE_TEMPLATES[AuctionCategory.TECH_ELECTRONICS];
  const template = faker.helpers.arrayElement(templates);

  return template
    .replace("{ver}", String(faker.number.int({ min: 2, max: 15 })))
    .replace("{year}", String(faker.number.int({ min: 2018, max: 2026 })))
    .replace("{storage}", String(faker.helpers.arrayElement([64, 128, 256, 512])))
    .replace("{size}", String(faker.number.int({ min: 25, max: 50 })))
    .replace("{size}", String(faker.number.int({ min: 25, max: 50 }))); // second {size} for rug dimensions
}

// ---------------------------------------------------------------------------
// Mock Auction Factory
// ---------------------------------------------------------------------------

/**
 * Creates mock auction data.
 *
 * @param count - Number of auctions to generate (default: 100)
 * @returns Deterministic array of `AuctionSummary`
 */
export function createMockAuctions(count: number = 100): AuctionSummary[] {
  faker.seed(FAKER_SEED);

  const now = new Date();
  const auctions: AuctionSummary[] = [];

  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(AUCTION_CATEGORY_VALUES);
    const condition = faker.helpers.arrayElement(AUCTION_CONDITION_VALUES);
    const location = faker.helpers.arrayElement([...JORDANIAN_LOCATIONS]);

    // --- Status: ~75% Active, ~10% Ended, ~10% Scheduled/Draft, ~5% Cancelled
    const statusRoll = faker.number.int({ min: 1, max: 100 });
    let status: AuctionStatus;
    if (statusRoll <= 75) {
      status = AuctionStatus.ACTIVE;
    } else if (statusRoll <= 85) {
      status = AuctionStatus.ENDED;
    } else if (statusRoll <= 95) {
      status = AuctionStatus.SCHEDULED;
    } else {
      status = AuctionStatus.CANCELLED;
    }

    // --- Pricing
    const isMotors = category === AuctionCategory.MOTORS;
    const startingPrice = isMotors
      ? faker.number.int({ min: 5000, max: 80000 })
      : faker.number.int({ min: 5, max: 5000 });

    // Round to clean values
    const roundedStartingPrice = Math.round(startingPrice / 5) * 5;

    const hasBids = faker.datatype.boolean({ probability: 0.8 });
    const bidCount = hasBids ? faker.number.int({ min: 1, max: 65 }) : 0;

    const bidIncrement = roundedStartingPrice < 100
      ? faker.helpers.arrayElement([1, 2, 5])
      : roundedStartingPrice < 1000
        ? faker.helpers.arrayElement([5, 10, 25])
        : roundedStartingPrice < 10000
          ? faker.helpers.arrayElement([25, 50, 100])
          : faker.helpers.arrayElement([100, 250, 500]);

    const currentBid = hasBids
      ? roundedStartingPrice + bidIncrement * faker.number.int({ min: 1, max: bidCount + 5 })
      : null;

    // --- End date: mostly future for active, past for ended
    let endDate: Date;
    if (status === AuctionStatus.ENDED) {
      // Ended 1-30 days ago
      endDate = new Date(now.getTime() - faker.number.int({ min: 1, max: 30 }) * 24 * 60 * 60 * 1000);
    } else if (status === AuctionStatus.ACTIVE) {
      // 1 hour to 14 days from now
      const hoursFromNow = faker.number.int({ min: 1, max: 336 }); // 336 = 14 days
      endDate = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
    } else {
      // Scheduled/Draft/Cancelled — 7 to 30 days from now
      endDate = new Date(now.getTime() + faker.number.int({ min: 7, max: 30 }) * 24 * 60 * 60 * 1000);
    }

    // --- Created at: 1-60 days ago
    const createdAt = new Date(now.getTime() - faker.number.int({ min: 1, max: 60 }) * 24 * 60 * 60 * 1000);

    auctions.push({
      id: `auction-${String(i + 1).padStart(3, "0")}`,
      title: generateTitle(category),
      imageUrl: `https://picsum.photos/seed/auction-${i + 1}/600/400`,
      category,
      condition,
      status,
      pricing: {
        startingPrice: roundedStartingPrice,
        currentBid,
        bidCount,
      },
      timing: {
        endDate: endDate.toISOString(),
        createdAt: createdAt.toISOString(),
      },
      location,
      isFavorite: faker.datatype.boolean({ probability: 0.15 }),
      isOwner: false,
    });
  }

  return auctions;
}

// ---------------------------------------------------------------------------
// Pre-generated Instance
// ---------------------------------------------------------------------------

/** Deterministic set of 100 mock auctions, generated once at import time. */
export const mockAuctions: AuctionSummary[] = createMockAuctions();

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/** Returns only Active auctions. */
export function getActiveMockAuctions(): AuctionSummary[] {
  return mockAuctions.filter((a) => a.status === AuctionStatus.ACTIVE);
}

/** Finds a single auction by ID. */
export function getMockAuctionById(id: string): AuctionSummary | undefined {
  return mockAuctions.find((a) => a.id === id);
}

/** Returns auctions matching the given category. */
export function getMockAuctionsByCategory(
  category: AuctionCategory,
): AuctionSummary[] {
  return mockAuctions.filter((a) => a.category === category);
}
