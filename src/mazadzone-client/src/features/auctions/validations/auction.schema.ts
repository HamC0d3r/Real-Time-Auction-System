import { z } from "zod";
import { AuctionCategory } from "../types/auction.types";

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

    startingPrice: z
      .number({ message: "Starting price is required" })
      .positive("Starting price must be greater than 0")
      .max(1_000_000, "Starting price cannot exceed $1,000,000"),

    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export type CreateAuctionFormValues = z.infer<typeof createAuctionSchema>;
