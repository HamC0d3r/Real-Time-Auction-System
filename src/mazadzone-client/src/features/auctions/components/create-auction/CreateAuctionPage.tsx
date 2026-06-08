"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { ROUTES } from "@/config/routes.config";
import { useRequireRole } from "@/hooks/use-require-role";
import { AppAlert } from "@/components/feedback/app-alert";
import { useAppToast } from "@/lib/toast/app-toast";
import type { ApiError } from "@/types/api.types";
import { generateUUID } from "@/utils/uuid.utils";
import { useCreateAuction } from "../../api/auction.mutations";
import { AuctionCategory, AuctionSubcategory, AuctionCondition } from "../../types/auction.types";
import {
  createAuctionSchema,
  parseDotFormattedPrice,
  type CreateAuctionFormValues
} from "../../validations/auction.schema";

// Import modular subcomponents
import { AuctionImageUploader } from "./AuctionImageUploader";
import { AuctionDetailsForm } from "./AuctionDetailsForm";
import { AuctionTimingForm } from "./AuctionTimingForm";

interface ImagePreview {
  id: string;
  url: string;
  file: File;
}

export function CreateAuctionPage() {
  const router = useRouter();
  const { mutateAsync: createAuction, isPending } = useCreateAuction();
  const appToast = useAppToast();

  const { isAuthorized, isLoading: isAuthLoading } = useRequireRole(["seller"], {
    loginMessage: "Please log in to create a new auction listing.",
    unauthorizedMessage: "You must activate your seller privileges to list new auctions.",
    bypassTesting: false, // Keep bypass testing for local development/testing
  });

  // Image preview state tracking
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const methods = useForm<CreateAuctionFormValues>({
    resolver: zodResolver(createAuctionSchema),
    mode: "onSubmit",
    defaultValues: {
      title: "",
      description: "",
      category: "" as unknown as AuctionCategory,
      subcategory: "" as unknown as AuctionSubcategory,
      condition: "" as unknown as AuctionCondition,
      conditionDescription: "",
      startingPrice: "",
      minimumIncrement: "",
      shippingLocation: "Amman, Jordan",
      startDate: "",
      endDate: "",
      images: [],
    },
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  // Sync previews cleanup
  useEffect(() => {
    return () => {
      // Cleanup object URLs to prevent memory leaks
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  if (isAuthLoading || !isAuthorized) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-semibold">Verifying credentials...</p>
        </div>
      </PageWrapper>
    );
  }

  // Handler for adding files
  const handleFilesSelected = (files: FileList) => {
    const validFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );

    const newPreviews = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      url: URL.createObjectURL(file),
      file,
    }));

    const updatedPreviews = [...imagePreviews, ...newPreviews].slice(0, 10);
    setImagePreviews(updatedPreviews);

    // Sync files directly to react-hook-form value array
    setValue("images", updatedPreviews.map((p) => p.file), { shouldValidate: true });
  };

  // Remove previewed image
  const handleImageRemoved = (idToRemove: string) => {
    const target = imagePreviews.find((p) => p.id === idToRemove);
    if (target) {
      URL.revokeObjectURL(target.url);
    }
    const updated = imagePreviews.filter((p) => p.id !== idToRemove);
    setImagePreviews(updated);
    setValue("images", updated.map((p) => p.file), { shouldValidate: true });
  };

  // Submit Handler
  const onSubmit = async (data: CreateAuctionFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    // Formats and converts potential 12-hour AM/PM formats to 24-hour (military) formats safely
    const formatToSlashDate = (dateTimeStr: string): string => {
      if (!dateTimeStr) return "";
      
      const cleanStr = dateTimeStr.trim();
      const parts = cleanStr.split(/[T ]/);
      const datePart = parts[0].replace(/-/g, "/"); // Convert to yyyy/mm/dd
      const timePart = parts[1] || "00:00";
      
      const hasPm = /pm/i.test(cleanStr);
      const hasAm = /am/i.test(cleanStr);
      
      if (hasPm || hasAm) {
        // Strip AM/PM indicators and parse components
        const cleanTime = timePart.replace(/am|pm/i, "").trim();
        const timeParts = cleanTime.split(":");
        let hour = parseInt(timeParts[0], 10);
        const minute = timeParts[1] || "00";
        
        if (hasPm && hour < 12) {
          hour += 12;
        } else if (hasAm && hour === 12) {
          hour = 0;
        }
        
        const formattedHour = String(hour).padStart(2, "0");
        return `${datePart} ${formattedHour}:${minute}`;
      }
      
      return `${datePart} ${timePart}`;
    };

    let auctionFolderId = "";

    try {
      // 1. Generate a unique folder ID for the auction images
      auctionFolderId = generateUUID();

      // 2. Upload the images to our dynamic Route Handler
      const uploadFormData = new FormData();
      if (data.images && data.images.length > 0) {
        data.images.forEach((imgFile) => {
          uploadFormData.append("images", imgFile);
        });
      }

      const uploadResponse = await fetch(`/api/upload?auctionId=${auctionFolderId}`, {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errData = await uploadResponse.json();
        throw new Error(errData.error || "Failed to upload auction images.");
      }

      const uploadResult = await uploadResponse.json();
      const imageUrls: string[] = uploadResult.urls;

      // 3. Build creation payload with the uploaded image URLs
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory || "",
        condition: data.condition as AuctionCondition,
        conditionDescription: data.conditionDescription,
        startingPrice: parseDotFormattedPrice(data.startingPrice),
        minimumIncrement: parseDotFormattedPrice(data.minimumIncrement),
        shippingLocation: data.shippingLocation,
        startDate: formatToSlashDate(data.startDate),
        endDate: formatToSlashDate(data.endDate),
        images: imageUrls,
      };

      console.log("Create Auction onSubmit form payload:", payload);

      await createAuction(payload);

      setSubmitSuccess(true);
      appToast.success("Auction created!", "Redirecting to your dashboard...");

      // Delay navigation slightly to let success animation play
      setTimeout(() => {
        router.push(ROUTES.SELLER.AUCTIONS);
      }, 1500);
    } catch (error) {
      const err = error as Partial<ApiError>;
      console.error("Auction creation failed:", {
        message: err.message,
        statusCode: err.statusCode,
        errors: err.errors,
      });

      // Cleanup uploaded images on backend failure to prevent orphaned filesystem files
      if (auctionFolderId) {
        try {
          await fetch(`/api/upload?auctionId=${auctionFolderId}`, {
            method: "DELETE",
          });
          console.log("Successfully cleaned up uploaded images after API error");
        } catch (cleanupErr) {
          console.error("Failed to cleanup uploaded images on failure:", cleanupErr);
        }
      }

      const errorMessage = err.message || "Failed to create auction. Please check the inputs.";
      setSubmitError(errorMessage);
      appToast.error("Failed to create auction", errorMessage);

      // Map backend validation errors back to react-hook-form fields if present (safely guarding against null and arrays)
      if (err.errors && typeof err.errors === "object" && !Array.isArray(err.errors)) {
        Object.entries(err.errors).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            const lowerKey = key.toLowerCase();
            const formKey = Object.keys(methods.getValues()).find(
              (k) => k.toLowerCase() === lowerKey
            ) as keyof CreateAuctionFormValues | undefined;

            if (formKey) {
              methods.setError(formKey, {
                type: "server",
                message: messages[0],
              });
            }
          }
        });
      }
    }
  };

  return (
    <PageWrapper className="py-10 px-4 md:px-6">
      <main className="max-w-5xl mx-auto space-y-8">

        {/* Header Block */}
        <div className="flex items-center justify-between text-left">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight md:text-4xl">
              Create Auction
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Fill in the details to create a new auction
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {submitSuccess && (
          <AppAlert
            type="success"
            title="Auction created successfully!"
            message="Redirecting to your dashboard..."
            className="animate-fade-in"
          />
        )}

        {/* Error Banner */}
        {submitError && (
          <AppAlert
            type="error"
            title="Failed to create auction"
            message={submitError}
            className="animate-fade-in"
          />
        )}

        {/* Primary Form wrapped in FormProvider */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-card text-card-foreground border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8 text-left">

            {/* Component 1: Image Uploader */}
            <AuctionImageUploader
              imagePreviews={imagePreviews}
              onFilesSelected={handleFilesSelected}
              onImageRemoved={handleImageRemoved}
              error={errors.images?.message as string}
            />

            {/* Component 2: Main Details & Dynamic Specs */}
            <AuctionDetailsForm />

            {/* Component 3: Schedule Timings */}
            <AuctionTimingForm />

            {/* Section 4: Create Auction Button */}
            <div className="flex justify-end pt-4 border-t border-border/40">
              <Button
                type="submit"
                disabled={isPending || submitSuccess}
                className="w-full sm:w-[220px] rounded-xl h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-extrabold text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Auction...
                  </>
                ) : (
                  "Create Auction"
                )}
              </Button>
            </div>

          </form>
        </FormProvider>
      </main>
    </PageWrapper>
  );
}
