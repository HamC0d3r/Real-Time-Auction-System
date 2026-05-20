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
  AuctionSubcategory,
} from "../types/auction.types";
import type { AuctionSummary, BidHistoryEntry, Seller } from "../types/auction.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FAKER_SEED = 123;

const MOCK_BIDDERS = [
  { name: "Ahmad K.", initial: "A" },
  { name: "Sarah M.", initial: "S" },
  { name: "Omar J.",  initial: "O" },
  { name: "Layla R.", initial: "L" },
  { name: "Khalid N.",initial: "K" },
  { name: "Nour A.",  initial: "N" },
  { name: "Tariq M.", initial: "T" },
  { name: "Dina H.",  initial: "D" },
];

const MOCK_SELLERS: Seller[] = [
  { id: "seller-123", fullName: "Ahmad Al-Rashid", email: "ahmad@mazadzone.com", role: "seller", isVerified: true, avatarInitial: "A", reviews: 277, rating: 4.6 },
  { id: "seller-456", fullName: "Fatima Mansour", email: "fatima@mazadzone.com", role: "seller", isVerified: true, avatarInitial: "F", reviews: 142, rating: 4.8 },
  { id: "seller-789", fullName: "Yousef Hassan", email: "yousef@mazadzone.com", role: "seller", isVerified: false, avatarInitial: "Y", reviews: 89, rating: 4.2 },
];

const TIME_AGO_LABELS = [
  "3 mins ago",  "9 mins ago",  "23 mins ago", "1 hour ago",  "2 hours ago",
  "3 hours ago", "5 hours ago", "8 hours ago", "12 hours ago","1 day ago",
  "2 days ago",  "3 days ago",  "4 days ago",  "5 days ago",  "6 days ago",
];


const AUCTION_CATEGORY_VALUES = Object.values(AuctionCategory);
const AUCTION_CONDITION_VALUES = Object.values(AuctionCondition);
const AUCTION_SUBCATEGORY_VALUES = Object.values(AuctionSubcategory);

// Mapping categories to their valid subcategories for realistic mock data
const CATEGORY_TO_SUBCATEGORIES: Record<string, AuctionSubcategory[]> = {
  [AuctionCategory.TECH_ELECTRONICS]: [AuctionSubcategory.LAPTOPS, AuctionSubcategory.SMARTPHONES, AuctionSubcategory.CAMERAS],
  [AuctionCategory.FASHION_STYLE]: [AuctionSubcategory.WATCHES, AuctionSubcategory.SHOES, AuctionSubcategory.ACCESSORIES],
  [AuctionCategory.MOTORS]: [AuctionSubcategory.CARS, AuctionSubcategory.MOTORCYCLES],
  [AuctionCategory.HOME_LIVING]: [AuctionSubcategory.FURNITURE, AuctionSubcategory.DECOR],
  [AuctionCategory.COLLECTIBLES_ART]: [AuctionSubcategory.DECOR], // fallback
  [AuctionCategory.HOBBIES_LEISURE]: [AuctionSubcategory.ACCESSORIES], // fallback
};

/**
 * Curated Unsplash photo IDs per category.
 * Each pool has 15 IDs — auctions pick a consecutive slice so gallery
 * images look like multiple shots of the same product.
 *
 * To update: visit https://unsplash.com/s/photos/<keyword> and copy the
 * photo ID from the URL (e.g. /photos/abc123xyz → "abc123xyz").
 */
const CATEGORY_PHOTO_IDS: Record<string, string[]> = {
  [AuctionCategory.TECH_ELECTRONICS]: [
    "1517336714731-489689fd1ca8", // MacBook on desk
    "1496181133206-80ce9b88a853", // laptop open
    "1517694712202-14dd9538aa97", // laptop closeup
    "1593640408182-31c70c8268f5", // camera
    "1510557880182-3d4d3cba35a5", // camera lens
    "1609091839311-d5365f9ff1c5", // drone
    "1588872657578-7efd1f1555ed", // headphones
    "1505740420928-5e560c06d30e", // Sony headphones
    "1606041008023-7ba3d5ae9f5b", // AirPods
    "1601524909162-71cff7dfdfb7", // iPhone
    "1512499617640-c74ae3a79d37", // phone on table
    "1551808525-51a94da548ce", // gaming console
    "1574944985070-8f3ebc6b79d2", // MacBook Air
    "1547394765-185e1e68c48e", // monitor setup
    "1593359677879-a4bb92f4e852", // tablet
  ],
  [AuctionCategory.FASHION_STYLE]: [
    "1523275335684-37898b6baf30", // watch close-up
    "1548171915-e79a6bca163e", // luxury watch
    "1587836374828-4dbafa94cf0e", // Rolex
    "1553062407-98eeb64c6a62", // fashion bag
    "1548036161-16b1955ece95", // handbag
    "1584917865442-de89df76afd3", // Gucci sneaker
    "1542291026-7eec264c27ff", // shoe side view
    "1542272604-787c3835535d", // shoes on floor
    "1600185365483-26d7a4cc7519", // sneakers
    "1507003211169-0a1dd7228f2d", // bracelet
    "1515562141207-7a88fb7ce338", // necklace
    "1605100804763-247f67b3557e", // sunglasses
    "1511499767150-a7a1371512a3", // sunglasses side
    "1622495966027-e0ef3af3d716", // wallet leather
    "1638532165006-f3c6c12ee7e7", // luxury watch wrist
  ],
  [AuctionCategory.HOME_LIVING]: [
    "1555041469-a586c61ea9bc", // sofa
    "1538688525198-9b2d3ccf2d43", // living room
    "1631679706909-1844bbd07221", // kitchen
    "1556909114-f6e7ad7d3136", // coffee machine
    "1585771724684-38269d6639fd", // dining table
    "1493663284031-b7e3aefcae8e", // bedroom
    "1505691938895-1758d7feb511", // couch close-up
    "1616594039964-ae9021a400a0", // modern kitchen
    "1484154218962-a197022b5858", // kitchen appliance
    "1542621334-a254cf47b0fb", // vacuum cleaner
    "1513694203232-719a280e0f79", // lamp
    "1556742502-ec7c0e9f34b1", // dining chairs
    "1540518614846-7eded433c457", // bookshelf
    "1567538096630-e3838c9eba03", // rug
    "1565183928294-7063f23ce0f8", // home decor
  ],
  [AuctionCategory.COLLECTIBLES_ART]: [
    "1578926375605-eaf7559b1458", // painting gallery
    "1561214115-f2f134cc4912", // art painting
    "1577083552440-2c746a6cfecc", // vinyl record
    "1611532736597-de2d4265fba3", // stamps collection
    "1567016432779-094069958ea5", // collectibles shelf
    "1550399105-c4db5952ebf2", // antique items
    "1558618666-fcd25c85cd64", // old books
    "1507652313519-a5df83028c0f", // coin collection
    "1571115764595-644a1f56a55c", // antique clock
    "1519681393784-d120267933ba", // pottery
    "1547245986-3d6ec5af855c", // art sculpture
    "1601661578093-32db1d979e94", // art exhibition
    "1605792657660-596af9009e82", // board game
    "1588097255699-af1d0a9f9e23", // camera vintage
    "1578749556568-bc2c40e68b61", // old photographs
  ],
  [AuctionCategory.HOBBIES_LEISURE]: [
    "1558618666-fcd25c85cd64", // guitar
    "1510915361894-db8b60106cb1", // acoustic guitar
    "1519331379826-f10be5486c6f", // bicycle
    "1576858574144-9ae1ebcf5ae5", // mountain bike
    "1577223625816-7546f13df25d", // camping tent
    "1545558014-8692077e9b5c", // telescope
    "1560518883-ce09059eeffa", // LEGO bricks
    "1606761568499-6d2451b23c66", // fishing rod
    "1535131749447-e89b60c7cf72", // piano keys
    "1550000000-b7dc7399e239", // golf clubs
    "1566519463851-b7815cb6deff", // drone hobby
    "1592890288564-76628a30a657", // skateboard
    "1571019613454-1cb2f99b2d8b", // tennis racket
    "1551524559-8af4e6624178", // scuba diving
    "1602526213836-1e91f97bba0b", // archery bow
  ],
  [AuctionCategory.MOTORS]: [
    "1544636331-e46b7a66bf12", // BMW car front
    "1503376780353-7e6692767b70", // luxury car interior
    "1553440569-bcc63803a83d", // car side view
    "1549317661-cf369843c4c2", // Mercedes
    "1574016077-72cc3adf1d4a", // Toyota
    "1558981403-c5f9899a28bc", // motorcycle
    "1568772585407-9f9a38082cb4", // Harley
    "1449426468159-d96dbf08f19f", // sports car
    "1583121274602-3e2820c69888", // car detail
    "1547038577-da80abbc4f19", // Jeep offroad
    "1592198084033-aade0d98d314", // car interior
    "1502877338535-766e1452684a", // porsche
    "1519085360753-af0119f7cbe7", // car track
    "1541899481282-d53bffe3c35d", // motorcycle parked
    "1606016159991-31f6f2f0e1b2", // Ducati
  ],
};

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
// Bid History Generator
// ---------------------------------------------------------------------------

function generateBidHistory(
  currentBid: number | null,
  startingPrice: number,
  bidCount: number,
  auctionIndex: number,
): BidHistoryEntry[] {
  if (bidCount === 0 || currentBid === null) return [];

  const count = Math.min(bidCount, 15);
  const increment = startingPrice < 100 ? 5 : startingPrice < 1000 ? 50 : startingPrice < 10000 ? 100 : 500;

  return Array.from({ length: count }, (_, i) => ({
    id: `auction-${auctionIndex}-bid-${i}`,
    bidderName:    MOCK_BIDDERS[(auctionIndex + i) % MOCK_BIDDERS.length].name,
    bidderInitial: MOCK_BIDDERS[(auctionIndex + i) % MOCK_BIDDERS.length].initial,
    amount: currentBid - i * increment,
    timeAgo: TIME_AGO_LABELS[i] ?? `${i * 5} mins ago`,
    isHighest: i === 0,
  }));
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
    const subcategories = CATEGORY_TO_SUBCATEGORIES[category] || [AuctionSubcategory.ACCESSORIES];
    const subcategory = faker.helpers.arrayElement(subcategories);
    const condition = faker.helpers.arrayElement(AUCTION_CONDITION_VALUES);

    // --- Status: ~75% Active, ~15% Upcoming, ~10% Ended
    const statusRoll = faker.number.int({ min: 1, max: 100 });
    let status: AuctionStatus;
    if (statusRoll <= 75) {
      status = AuctionStatus.ACTIVE;
    } else if (statusRoll <= 90) {
      status = AuctionStatus.UPCOMING;
    } else {
      status = AuctionStatus.ENDED;
    }

    // --- Pricing
    const isMotors = category === AuctionCategory.MOTORS;
    const startingPrice = isMotors
      ? faker.number.int({ min: 5000, max: 80000 })
      : faker.number.int({ min: 5, max: 5000 });

    // Round to clean values
    const roundedStartingPrice = Math.round(startingPrice / 5) * 5;

    const hasBids = status === AuctionStatus.UPCOMING ? false : faker.datatype.boolean({ probability: 0.8 });
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

    // --- Dates: generate realistic start and end dates based on status
    let startDate: Date;
    let endDate: Date;
    if (status === AuctionStatus.ENDED) {
      // Ended 1-30 days ago
      endDate = new Date(now.getTime() - faker.number.int({ min: 1, max: 30 }) * 24 * 60 * 60 * 1000);
      startDate = new Date(endDate.getTime() - faker.number.int({ min: 1, max: 14 }) * 24 * 60 * 60 * 1000);
    } else if (status === AuctionStatus.ACTIVE) {
      // 1 hour to 14 days from now
      const hoursFromNow = faker.number.int({ min: 1, max: 336 }); // 336 = 14 days
      endDate = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
      startDate = new Date(now.getTime() - faker.number.int({ min: 1, max: 14 }) * 24 * 60 * 60 * 1000);
    } else {
      // Upcoming — 1 to 7 days from now
      startDate = new Date(now.getTime() + faker.number.int({ min: 1, max: 7 }) * 24 * 60 * 60 * 1000);
      endDate = new Date(startDate.getTime() + faker.number.int({ min: 1, max: 14 }) * 24 * 60 * 60 * 1000);
    }

    startDate.setSeconds(0, 0);
    endDate.setSeconds(0, 0);

    // --- Created at: 1-60 days ago
    const createdAt = new Date(Math.min(startDate.getTime() - faker.number.int({ min: 1, max: 30 }) * 24 * 60 * 60 * 1000, now.getTime() - 1000));

    // --- Gallery images: curated Unsplash IDs per category, varied per auction
    //     Each auction picks a "photo pool" from its category and uses consecutive
    //     IDs so every gallery image is a real product shot in the same family.
    const categoryPhotoPool = CATEGORY_PHOTO_IDS[category] ?? CATEGORY_PHOTO_IDS[AuctionCategory.TECH_ELECTRONICS];
    const poolSize = categoryPhotoPool.length;
    // Start offset cycles through pool based on auction index
    const startOffset = (i * 3) % poolSize;
    const imageCount = faker.number.int({ min: 3, max: Math.min(12, poolSize) });
    const images: string[] = Array.from({ length: imageCount }, (_, imgIdx) => {
      const photoId = categoryPhotoPool[(startOffset + imgIdx) % poolSize];
      return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80`;
    });
    const primaryImageUrl = images[0];

    // --- Bid history: empty when no bids, up to 15 entries
    const bidHistory = generateBidHistory(currentBid, roundedStartingPrice, bidCount, i);

    auctions.push({
      id: `auction-${String(i + 1).padStart(3, "0")}`,
      title: generateTitle(category),
      imageUrl: primaryImageUrl,
      category,
      subcategory,
      condition,
      status,
      pricing: {
        startingPrice: roundedStartingPrice,
        currentBid,
        bidCount,
      },
      timing: {
        startDate: startDate,
        endDate: endDate,
        creationDate: createdAt.toISOString(),
      },
      isFavorite: faker.datatype.boolean({ probability: 0.15 }),
      isOwner: i === 0,
      images,
      bidHistory,
      seller: MOCK_SELLERS[i % MOCK_SELLERS.length],
    });
  }

  return auctions;
}

// ---------------------------------------------------------------------------
// Pre-generated Instance
// ---------------------------------------------------------------------------

/** Deterministic set of 100 mock auctions, generated dynamically per request to keep dates relative to "now". */
export function getMockAuctions(): AuctionSummary[] {
  return createMockAuctions();
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/** Returns only Active auctions. */
export function getActiveMockAuctions(): AuctionSummary[] {
  return getMockAuctions().filter((a) => a.status === AuctionStatus.ACTIVE);
}

/** Finds a single auction by ID. */
export function getMockAuctionById(id: string): AuctionSummary | undefined {
  return getMockAuctions().find((a) => a.id === id);
}

/** Returns auctions matching the given category. */
export function getMockAuctionsByCategory(
  category: AuctionCategory,
): AuctionSummary[] {
  return getMockAuctions().filter((a) => a.category === category);
}
