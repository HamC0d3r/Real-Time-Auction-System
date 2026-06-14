import { z } from "zod";
import { AuctionCategory, AuctionSubcategory, AuctionCondition } from "../types/auction.types";

import { parseDotFormattedPrice } from "@/utils/currency.utils";

export { parseDotFormattedPrice };

/**
 * Zod schema for the "Create Auction" form.
 *
 * Used with react-hook-form's zodResolver for
 * client-side validation before API submission.
 */
export const createAuctionSchema = z
  .object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(45, "Title must be at most 45 characters"),

    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description must be at most 2000 characters"),

    category: z.string().min(1, "Please select a category"),

    subcategory: z.string().optional().nullable(),

    condition: z.enum(
      Object.values(AuctionCondition) as [string, ...string[]],
      { message: "Please select an item condition" },
    ),

    conditionDescription: z
      .string()
      .min(5, "Condition details must be at least 5 characters")
      .max(1000, "Condition details cannot exceed 1000 characters"),

    startingPrice: z
      .string()
      .min(1, "Starting price is required")
      .refine((val) => {
        const num = parseDotFormattedPrice(val);
        return !isNaN(num) && num > 0;
      }, "Starting price must be a positive number")
      .refine((val) => {
        const num = parseDotFormattedPrice(val);
        return num <= 1_000_000;
      }, "Starting price cannot exceed 1,000,000 JD"),

    minimumIncrement: z
      .string()
      .min(1, "Minimum increment is required")
      .refine((val) => {
        const num = parseDotFormattedPrice(val);
        return !isNaN(num) && num > 0;
      }, "Minimum increment must be a positive number")
      .refine((val) => {
        const num = parseDotFormattedPrice(val);
        return num <= 100_000;
      }, "Minimum increment cannot exceed 100,000 JD"),

    shippingLocation: z
      .string()
      .min(3, "Shipping location is required"),

    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine(
        (val) => {
          const start = new Date(val);
          if (isNaN(start.getTime())) return true; // Skip if invalid format (let other validations catch)
          const now = new Date();
          now.setMinutes(now.getMinutes() - 1);
          return start >= now;
        },
        { message: "Start date and time must be in the future" }
      ),

    endDate: z
      .string()
      .min(1, "End date is required"),
    
    images: z
      .array(z.any())
      .min(1, "At least one auction image is required")
      .max(10, "You can upload up to 10 images"),
  })
  // Comparison validation between start and end dates
  .refine(
    (data) => {
      if (!data.startDate || data.startDate.trim() === "" || !data.endDate || data.endDate.trim() === "") {
        return true; // Handle required checks at field level
      }

      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return true;
      }

      return end > start;
    },
    {
      message: "End date and time must be after the start date and time",
      path: ["endDate"],
    }
  );

export type CreateAuctionFormValues = z.infer<typeof createAuctionSchema>;
