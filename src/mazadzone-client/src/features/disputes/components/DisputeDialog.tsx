"use client";

import Image from "next/image";
import { memo, useEffect, useId, useMemo, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ImagePlus,
  FileImage,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppToast } from "@/lib/toast/app-toast";
import { disputeSchema, type DisputeFormValues } from "../validations/disputes.schemas";
import { useFileDispute, useGetDisputeTypes } from "../api/disputes.queries";

const EMPTY_EVIDENCE_FILES: File[] = [];

interface EvidencePreview {
  file: File;
  previewUrl: string;
}

interface DisputeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  itemName: string;
}

export const DisputeDialog = memo(function DisputeDialog({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  itemName,
}: DisputeDialogProps) {
  const { mutateAsync: fileDispute, isPending } = useFileDispute();
  const { data: disputeTypes = [], isLoading: isLoadingDisputeTypes } = useGetDisputeTypes();
  const appToast = useAppToast();
  const evidenceInputId = useId();
  const evidenceInputRef = useRef<HTMLInputElement | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      disputeTypeId: "",
      title: "",
      description: "",
      evidenceFiles: [],
    },
  });

  const activeDisputeTypes = useMemo(
    () => disputeTypes.filter((type) => type.isActive),
    [disputeTypes],
  );

  // Watch description to update the character counter
  const descriptionValue = useWatch({
    control,
    name: "description",
  }) || "";
  const evidenceFiles =
    useWatch({
      control,
      name: "evidenceFiles",
    }) ?? EMPTY_EVIDENCE_FILES;
  const evidencePreviews = useMemo<EvidencePreview[]>(
    () =>
      evidenceFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    [evidenceFiles],
  );

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        disputeTypeId: "",
        title: "",
        description: "",
        evidenceFiles: [],
      });

      if (evidenceInputRef.current) {
        evidenceInputRef.current.value = "";
      }
    }
  }, [isOpen, reset]);

  useEffect(() => {
    return () => {
      evidencePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.previewUrl);
      });
    };
  }, [evidencePreviews]);

  const handleFormSubmit = async (values: DisputeFormValues) => {
    try {
      await fileDispute({
        orderId,
        disputeTypeId: values.disputeTypeId,
        title: values.title,
        description: values.description,
        evidenceFiles: values.evidenceFiles,
      });
      appToast.success(
        "Dispute Submitted",
        "Your dispute has been sent to our team for review.",
      );
      onClose();
    } catch (err) {
      console.error("Failed to submit dispute:", err);
      appToast.error(
        "Submission Failed",
        err instanceof Error
          ? err.message
          : "We couldn't submit your dispute right now.",
      );
    }
  };

  const handleRemoveEvidence = (indexToRemove: number) => {
    setValue(
      "evidenceFiles",
      evidenceFiles.filter((_, index) => index !== indexToRemove),
      { shouldValidate: true, shouldDirty: true },
    );

    if (evidenceInputRef.current) {
      evidenceInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="!w-[calc(100vw-2rem)] !max-w-none overflow-hidden border border-border bg-card p-0 sm:!w-[min(1040px,calc(100vw-3rem))] sm:!max-w-[min(1040px,calc(100vw-3rem))] sm:rounded-2xl">
        {/* Header */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col gap-5 p-6">
            <DialogHeader className="flex flex-row items-start justify-between pb-1">
              <div className="flex flex-col gap-1 text-left">
                <DialogTitle className="text-xl font-bold text-foreground">
                  Open Dispute
                </DialogTitle>
                <p className="text-xs text-muted-foreground font-semibold">
                  Order {orderNumber} - {itemName}
                </p>
              </div>
            </DialogHeader>

            <div className="flex items-start gap-3 rounded-xl border border-warning-foreground/15 bg-warning p-4 text-xs text-warning-foreground">
              <AlertTriangle className="size-4.5 shrink-0 text-warning-foreground" />
              <p className="leading-relaxed font-semibold">
                Disputes are reviewed by our team within 48 hours. Please provide as much detail as possible.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dispute-type" className="text-sm font-bold text-foreground">
                Dispute Type <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="disputeTypeId"
                render={({ field }) => (
                  <Select
                    disabled={isPending || isLoadingDisputeTypes || activeDisputeTypes.length === 0}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger
                      id="dispute-type"
                      className="h-10 rounded-lg border-input bg-card text-sm focus:ring-primary"
                    >
                      <SelectValue
                        placeholder={
                          isLoadingDisputeTypes
                            ? "Loading dispute types..."
                            : "Select a dispute type"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      {activeDisputeTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.disputeTypeId ? (
                <span className="text-xs font-semibold text-destructive">
                  {errors.disputeTypeId.message}
                </span>
              ) : activeDisputeTypes.length === 0 && !isLoadingDisputeTypes ? (
                <span className="text-xs font-semibold text-muted-foreground">
                  No dispute types are available right now.
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title" className="text-sm font-bold text-foreground">
                Dispute Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter dispute title"
                {...register("title")}
                disabled={isPending}
                className="h-10 rounded-lg border-input bg-card px-3 text-sm focus-visible:border-primary focus-visible:ring-primary"
              />
              {errors.title && (
                <span className="text-xs font-semibold text-destructive">
                  {errors.title.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description" className="text-sm font-bold text-foreground">
                Dispute Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the issue with your order..."
                {...register("description")}
                disabled={isPending}
                maxLength={1000}
                className="min-h-[170px] resize-none overflow-x-hidden whitespace-pre-wrap break-words rounded-lg border-input bg-card text-sm focus-visible:ring-primary"
              />
              <div className="flex items-center justify-between">
                {errors.description ? (
                  <span className="text-xs font-semibold text-destructive">
                    {errors.description.message}
                  </span>
                ) : (
                  <span />
                )}
                <span className="text-[10px] font-bold text-muted-foreground/60 select-none">
                  {descriptionValue.length}/1000
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={onClose}
                disabled={isPending}
                variant="outline"
                className="h-11 flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || isLoadingDisputeTypes || activeDisputeTypes.length === 0}
                className="h-11 flex-1 rounded-xl bg-destructive px-4 py-2.5 text-xs font-bold text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Submit Dispute
              </Button>
            </div>
          </div>

          <div className="border-t border-border bg-muted/20 p-6 lg:border-l lg:border-t-0">
            <div className="flex h-full flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">
                    Evidence Images
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground">
                    Upload PNG or JPG images only. These images are uploaded first, then sent to the dispute API in the `images` field.
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <ImagePlus className="size-4.5" />
                </div>
              </div>

              <Controller
                control={control}
                name="evidenceFiles"
                render={({ field }) => (
                  <>
                    <input
                      id={evidenceInputId}
                      ref={evidenceInputRef}
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                      disabled={isPending}
                      className="hidden"
                      onChange={(event) => {
                        const nextFiles = Array.from(event.target.files ?? []);
                        const existingFiles = field.value ?? [];
                        const mergedFiles = [...existingFiles];

                        for (const file of nextFiles) {
                          const duplicateExists = mergedFiles.some(
                            (existingFile) =>
                              existingFile.name === file.name &&
                              existingFile.size === file.size &&
                              existingFile.lastModified === file.lastModified,
                          );

                          if (!duplicateExists) {
                            mergedFiles.push(file);
                          }
                        }

                        field.onChange(mergedFiles);
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => evidenceInputRef.current?.click()}
                      disabled={isPending}
                      className="flex min-h-36 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/35 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Upload className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          Add evidence images
                        </p>
                        <p className="text-xs font-medium text-muted-foreground">
                          Up to 5 files, PNG or JPG only
                        </p>
                      </div>
                    </button>
                  </>
                )}
              />

              {errors.evidenceFiles ? (
                <span className="text-xs font-semibold text-destructive">
                  {errors.evidenceFiles.message}
                </span>
              ) : null}

              {evidencePreviews.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {evidencePreviews.map((preview, index) => (
                    <div
                      key={`${preview.file.name}-${preview.file.lastModified}-${index}`}
                      className="overflow-hidden rounded-2xl border border-border bg-card"
                    >
                      <div className="relative aspect-square bg-muted">
                        <Image
                          src={preview.previewUrl}
                          alt={preview.file.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={() => handleRemoveEvidence(index)}
                          disabled={isPending}
                          className="absolute right-2 top-2 size-8 rounded-full bg-background/85 text-foreground shadow-sm hover:bg-background"
                          aria-label={`Remove ${preview.file.name}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <FileImage className="size-4 text-primary" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-foreground">
                            {preview.file.name}
                          </p>
                          <p className="text-[11px] font-medium text-muted-foreground">
                            {(preview.file.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-44 flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-border/70 bg-card px-6 py-8 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileImage className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      No evidence images added yet
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      Add clear photos to help our team review the dispute faster.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
