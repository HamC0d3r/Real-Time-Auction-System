"use client";

import { useEffect } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  DollarSign, 
  ChevronDown, 
  AlertCircle
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/config/routes.config";
import { AuctionCondition } from "../../types/auction.types";
import { useGetCategoryTree } from "../../api/auction.queries";
import { useGetProfileSettings } from "@/features/profile/api/profile.queries";
import { useAuthStore } from "@/stores/auth.store";

import { formatPriceOnBlur, unformatPriceOnFocus } from "@/utils/currency.utils";

export function AuctionDetailsForm() {
  const router = useRouter();
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext();

  const selectedCategory = useWatch({ name: "category", control });

  // 1. Fetch dynamic categories tree from ASP.NET Core API
  const { data: categoryTree } = useGetCategoryTree();

  // 2. Fetch shipping location dynamically from active user's profile settings
  const { user } = useAuthStore();
  const { data: profileSettings } = useGetProfileSettings(user?.id || "");

  const primaryAddressStr = (profileSettings
    ? [profileSettings.city, profileSettings.street, profileSettings.building ? `Bldg ${profileSettings.building}` : ""]
        .filter(Boolean)
        .join(", ")
    : "").trim() || "Amman, Jordan";

  // Initialize/Sync default shipping location
  useEffect(() => {
    if (primaryAddressStr) {
      setValue("shippingLocation", primaryAddressStr, { shouldValidate: true });
    }
  }, [primaryAddressStr, setValue]);

  // 3. Find selected category's subcategories
  const currentCategoryNode = categoryTree?.find((c) => c.id === selectedCategory);
  const subCategoriesList = currentCategoryNode?.subCategories || currentCategoryNode?.subcategories || currentCategoryNode?.children || [];
  const hasSubcategories = subCategoriesList.length > 0;

  // Sync subcategory resetting if category changes
  useEffect(() => {
    setValue("subcategory", "");
  }, [selectedCategory, setValue]);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="space-y-2 text-left">
        <Label htmlFor="title" className="text-base font-bold text-foreground flex items-center gap-1">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter auction title"
          className="h-12 rounded-xl border border-input bg-input-background text-base px-4 focus-visible:ring-2 focus-visible:ring-primary w-full"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-red-500 font-bold">{errors.title.message as string}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2 text-left">
        <Label htmlFor="description" className="text-base font-bold text-foreground flex items-center gap-1">
          Description <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="description"
          placeholder="Enter auction description"
          rows={4}
          className="rounded-xl border border-input bg-input-background text-base p-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none w-full min-h-[100px] font-medium leading-relaxed"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-red-500 font-bold">{errors.description.message as string}</p>
        )}
      </div>

      {/* Item Condition Details Section */}
      <div className="space-y-4 pt-1 text-left">
        {/* Item Condition Selector */}
        <div className="space-y-2">
          <Label htmlFor="condition" className="text-base font-bold text-foreground flex items-center gap-1">
            Condition of Item <span className="text-red-500">*</span>
          </Label>
            <Controller
              control={control}
              name="condition"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger id="condition" className="w-full bg-input-background font-semibold h-12 text-base rounded-xl">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {Object.values(AuctionCondition).map((cond) => (
                      <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          {errors.condition && (
            <p className="text-xs text-red-500 font-bold">{errors.condition.message as string}</p>
          )}
        </div>

        {/* Condition Description Textarea */}
        <div className="space-y-2">
          <Label htmlFor="conditionDescription" className="text-base font-bold text-foreground flex items-center gap-1">
            Condition Details / Status Log <span className="text-red-500">*</span>
          </Label>
          <textarea
            id="conditionDescription"
            placeholder="Describe the exact state of the item (e.g. Scratched corners, like new screen, original packaging)..."
            rows={3}
            className="rounded-xl border border-input bg-input-background text-base p-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none w-full min-h-[80px] font-medium leading-relaxed"
            {...register("conditionDescription")}
          />
          {errors.conditionDescription && (
            <p className="text-xs text-red-500 font-bold">{errors.conditionDescription.message as string}</p>
          )}
        </div>
      </div>

      {/* Category & Subcategory select side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
        {/* Category Selector */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-base font-bold text-foreground flex items-center gap-1">
            Category <span className="text-red-500">*</span>
          </Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger id="category" className="w-full bg-input-background font-semibold h-12 text-base rounded-xl">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  {categoryTree?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-xs text-red-500 font-bold">{errors.category.message as string}</p>
          )}
        </div>

        {/* Subcategory Selector - Always rendered to the right of category */}
        <div className="space-y-2">
          <Label htmlFor="subcategory" className="text-base font-bold text-foreground flex items-center gap-1">
            Subcategory
          </Label>
          <Controller
            control={control}
            name="subcategory"
            render={({ field }) => (
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""} 
                disabled={!selectedCategory || !hasSubcategories}
              >
                <SelectTrigger id="subcategory" className="w-full bg-input-background font-semibold h-12 text-base rounded-xl">
                  <SelectValue placeholder={
                    !selectedCategory 
                      ? "Select category first" 
                      : !hasSubcategories 
                      ? "No subcategories available" 
                      : "Select a subcategory"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  {subCategoriesList.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.subcategory && (
            <p className="text-xs text-red-500 font-bold">{errors.subcategory.message as string}</p>
          )}
        </div>
      </div>

      {/* Grid Layout: Start Bid Price & Minimum Increment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
        {/* Start Bid Price */}
        <div className="space-y-2">
          <Label htmlFor="startingPrice" className="text-base font-bold text-foreground flex items-center gap-1">
            Start Bid Price <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Controller
              name="startingPrice"
              control={control}
              render={({ field }) => (
                <>
                  <Input
                    id="startingPrice"
                    type="text"
                    placeholder="0.00"
                    className="h-12 rounded-xl border border-input bg-input-background text-base pl-4 pr-12 focus-visible:ring-2 focus-visible:ring-primary w-full font-mono font-semibold"
                    value={field.value || ""}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9.]/g, "");
                      const parts = val.split(".");
                      if (parts.length > 2) {
                        val = parts[0] + "." + parts.slice(1).join("");
                      }
                      if (parts[1] && parts[1].length > 2) {
                        val = parts[0] + "." + parts[1].slice(0, 2);
                      }
                      field.onChange(val);
                    }}
                    onBlur={() => {
                      if (field.value) {
                        field.onChange(formatPriceOnBlur(field.value));
                      }
                    }}
                    onFocus={() => {
                      if (field.value) {
                        field.onChange(unformatPriceOnFocus(field.value));
                      }
                    }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground pointer-events-none">
                    JD
                  </span>
                </>
              )}
            />
          </div>
          {errors.startingPrice && (
            <p className="text-xs text-red-500 font-bold">{errors.startingPrice.message as string}</p>
          )}
        </div>

        {/* Minimum Increment */}
        <div className="space-y-2">
          <Label htmlFor="minimumIncrement" className="text-base font-bold text-foreground flex items-center gap-1">
            Minimum Increment <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Controller
              name="minimumIncrement"
              control={control}
              render={({ field }) => (
                <>
                  <Input
                    id="minimumIncrement"
                    type="text"
                    placeholder="0.00"
                    className="h-12 rounded-xl border border-input bg-input-background text-base pl-4 pr-12 focus-visible:ring-2 focus-visible:ring-primary w-full font-mono font-semibold"
                    value={field.value || ""}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9.]/g, "");
                      const parts = val.split(".");
                      if (parts.length > 2) {
                        val = parts[0] + "." + parts.slice(1).join("");
                      }
                      if (parts[1] && parts[1].length > 2) {
                        val = parts[0] + "." + parts[1].slice(0, 2);
                      }
                      field.onChange(val);
                    }}
                    onBlur={() => {
                      if (field.value) {
                        field.onChange(formatPriceOnBlur(field.value));
                      }
                    }}
                    onFocus={() => {
                      if (field.value) {
                        field.onChange(unformatPriceOnFocus(field.value));
                      }
                    }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground pointer-events-none">
                    JD
                  </span>
                </>
              )}
            />
          </div>
          {errors.minimumIncrement && (
            <p className="text-xs text-red-500 font-bold">{errors.minimumIncrement.message as string}</p>
          )}
        </div>
      </div>

      {/* Shipping Location Address */}
      <div className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="shippingLocation" className="text-base font-bold text-foreground flex items-center gap-1">
            Shipping Location <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="shippingLocation"
              type="text"
              readOnly
              value={primaryAddressStr}
              placeholder="Retrieving your registered address..."
              className="h-12 rounded-xl border border-input bg-muted/65 text-muted-foreground pl-11 focus-visible:ring-0 focus-visible:outline-none w-full cursor-not-allowed select-none font-medium"
            />
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none stroke-[2.2]" />
          </div>
        </div>

        {/* Note for the seller */}
        <div className="text-xs text-muted-foreground bg-muted/30 border border-border p-3.5 rounded-xl flex flex-col gap-2">
          <span className="font-semibold text-foreground">Note for Sellers:</span>
          <span>Your shipping location is automatically set to your registered primary address. If you wish to change your shipping location, you must update your address in your profile settings.</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit font-bold text-xs mt-0.5 cursor-pointer"
            onClick={() => router.push(ROUTES.PROFILE.VIEW)}
          >
            Edit Address in Profile Settings
          </Button>
        </div>
        
        {errors.shippingLocation && (
          <p className="text-xs text-red-500 font-bold">{errors.shippingLocation.message as string}</p>
        )}
      </div>

    </div>
  );
}
