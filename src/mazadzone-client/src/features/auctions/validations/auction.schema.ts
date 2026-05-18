import { z } from "zod";
import { AuctionCategory, AuctionSubcategory, AuctionCondition } from "../types/auction.types";

export const parseDotFormattedPrice = (formattedStr: string): number => {
  if (!formattedStr) return 0;
  const cleanDigits = formattedStr.replace(/\./g, "");
  return parseFloat(cleanDigits) / 100;
};

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
      .max(100, "Title must be at most 100 characters"),

    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description must be at most 2000 characters"),

    category: z.enum(
      Object.values(AuctionCategory) as [string, ...string[]],
      { message: "Please select a category" },
    ),

    subcategory: z.enum(
      Object.values(AuctionSubcategory) as [string, ...string[]],
      { message: "Please select a subcategory" },
    ),

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

    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    
    images: z
      .array(z.any())
      .min(1, "At least one auction image is required")
      .max(10, "You can upload up to 10 images"),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
    },
    {
      message: "End date and time must be after the start date and time",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (!data.startDate) return true;
      const start = new Date(data.startDate);
      if (isNaN(start.getTime())) return false;
      const now = new Date();
      // 1-minute buffer for form latency
      now.setMinutes(now.getMinutes() - 1);
      return start >= now;
    },
    {
      message: "Start date and time must be in the future",
      path: ["startDate"],
    }
  );

export type CreateAuctionFormValues = z.infer<typeof createAuctionSchema>;
