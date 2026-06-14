"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ExternalLink, Quote, User, Store, X } from "lucide-react";

interface ImageWithFallbackProps extends Omit<React.ComponentProps<typeof Image>, 'src'> {
  src: string;
  fallbackSrc?: string;
}

function ImageWithFallback({ src, fallbackSrc = "/assets/images/placeholder.jpg", alt, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  return (
    <Image
      {...props}
      src={error || !src ? fallbackSrc : src}
      alt={alt}
      onError={() => {
        setError(true);
      }}
    />
  );
}
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Spinner } from "@/components/ui/spinner";
import { useGetDisputeDetails, useResolveDispute, useMarkDisputeUnderReview } from "../api/disputes.queries";
import { format } from "date-fns";

interface ViewDisputeSheetProps {
  disputeId: string;
  isOpen: boolean;
  onClose: () => void;
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" | "success" | "info" | "warning" | "review" {
  const s = status.toLowerCase().replace(/\s+/g, "-");
  if (s === "open") return "info";
  if (s === "under-review") return "review";
  if (s === "awaiting-response") return "warning";
  if (s === "resolved") return "success";
  if (s === "rejected") return "destructive";
  return "outline";
}

export function ViewDisputeSheet({ disputeId, isOpen, onClose }: ViewDisputeSheetProps) {
  const [resolutionStatus, setResolutionStatus] = useState<string>("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [isUnderReview, setIsUnderReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: dispute, isLoading } = useGetDisputeDetails(disputeId);
  const resolveDispute = useResolveDispute();
  const markUnderReview = useMarkDisputeUnderReview();

  const handleUnderReviewChange = (checked: boolean) => {
    setIsUnderReview(checked);
    if (checked) setResolutionStatus("");
  };

  const handleRadioChange = (val: string) => {
    setResolutionStatus(val);
    if (val === "resolved" || val === "rejected") setIsUnderReview(false);
  };

  const handleConfirmResolution = async () => {
    if (!dispute) return;

    setIsSubmitting(true);
    try {
      if (isUnderReview) {
        await markUnderReview.mutateAsync(dispute.id);
      } else if (resolutionStatus && resolutionNote.trim()) {
        await resolveDispute.mutateAsync({ id: dispute.id, resolution: resolutionNote.trim() });
      }
      onClose();
    } catch {
      // errors handled inside the mutation hooks with toasts
    } finally {
      setIsSubmitting(false);
    }
  };

  const canConfirm =
    (isUnderReview) ||
    (resolutionStatus && resolutionNote.trim().length >= 5);

  // First party is bidder, second is seller
  const bidder = dispute?.parties?.[0]?.bidder;
  const seller = dispute?.parties?.[0]?.seller;

  const attachments = dispute?.attachments ?? [];
  const auction = dispute?.auctionDetails;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-6xl! w-[95vw]! overflow-y-auto p-0 flex flex-col bg-background">
        <div className="p-6 md:p-8 flex flex-col gap-6 w-full">
          {/* Header */}
          <SheetHeader className="flex flex-row items-start justify-between text-left space-y-0">
            <div className="flex flex-col gap-1.5">
              <SheetTitle className="text-2xl font-bold">View Dispute</SheetTitle>
              <SheetDescription className="text-muted-foreground font-medium">
                Review the case details and resolve the dispute.
              </SheetDescription>
            </div>
          </SheetHeader>

          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner size="lg" />
            </div>
          ) : dispute ? (
            <>
              {/* Top Banner */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-5 rounded-xl border border-border bg-card shadow-sm">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dispute ID</span>
                  <span className="font-bold text-foreground text-sm truncate">{dispute.id}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dispute Type</span>
                  <span className="font-bold text-foreground">{dispute.disputeType}</span>
                </div>
                <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1 md:items-end">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Status</span>
                  <Badge variant={getStatusBadgeVariant(dispute.status)} className="w-fit text-sm px-2.5 py-0.5">
                    {dispute.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
                {/* Left Column */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                  {/* 1. Auction Details */}
                  {auction && (
                    <div className="flex flex-col gap-3">
                      <h3 className="font-bold text-foreground">1. Auction &amp; Product Details</h3>
                      <div className="border border-border rounded-xl p-5 bg-card shadow-sm flex flex-col sm:flex-row gap-5 items-start">
                        <div className="h-24 w-24 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center relative">
                          {auction.mainImageUrl ? (
                            <ImageWithFallback
                              key={auction.mainImageUrl}
                              src={auction.mainImageUrl}
                              alt={auction.title}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="bg-muted-foreground/20 w-full h-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-muted-foreground">Image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-3 flex-1 w-full">
                          <h4 className="font-bold text-lg text-foreground">{auction.title}</h4>
                          <div className="flex flex-col gap-1.5 w-full">
                            {auction.finalPrice != null && (
                              <div className="flex justify-between items-center w-full">
                                <span className="text-sm text-muted-foreground font-medium">Final Auction Price</span>
                                <span className="font-bold text-foreground">
                                  {auction.finalPrice.toLocaleString()} JOD
                                </span>
                              </div>
                            )}
                            {auction.endTime && (
                              <div className="flex justify-between items-center w-full">
                                <span className="text-sm text-muted-foreground font-medium">Auction Ended</span>
                                <span className="font-medium text-foreground">
                                  {format(new Date(auction.endTime), "MMM d, yyyy 'at' h:mm a")}
                                </span>
                              </div>
                            )}
                          </div>
                          <Button variant="outline" size="sm" className="w-fit mt-2 font-bold gap-2 bg-card hover:bg-muted">
                            View Auction
                            <ExternalLink className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Dispute Parties */}
                  {(bidder || seller) && (
                    <div className="flex flex-col gap-3">
                      <h3 className="font-bold text-foreground">2. Dispute Parties</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-border rounded-xl p-5 bg-card shadow-sm">
                        {bidder && (
                          <div className="flex items-center justify-between md:pr-6 md:border-r md:border-border">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <User className="size-6" />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Buyer</span>
                                <span className="font-bold text-sm text-foreground">{bidder.name}</span>
                                <span className="text-xs text-muted-foreground">{bidder.email}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {seller && (
                          <div className="flex items-center justify-between md:pl-2">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                <Store className="size-6" />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Seller</span>
                                <span className="font-bold text-sm text-foreground">{seller.name}</span>
                                <span className="text-xs text-muted-foreground">{seller.email}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. Dispute Description */}
                  <div className="flex flex-col gap-3">
                    <h3 className="font-bold text-foreground">3. Dispute Description</h3>
                    <div className="border border-border rounded-xl p-5 bg-card shadow-sm flex flex-col gap-2">
                      <p className="text-sm font-semibold text-foreground">{dispute.title}</p>
                      <div className="flex items-start gap-4">
                        <Quote className="size-6 text-muted-foreground shrink-0 rotate-180" />
                        <p className="text-sm font-medium leading-relaxed text-foreground">{dispute.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* 4. Attachments */}
                  {attachments.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <h3 className="font-bold text-foreground">4. Attachments / Evidence</h3>
                      <div className="border border-border rounded-xl p-5 bg-card shadow-sm">
                        <div className="flex flex-wrap items-center gap-3">
                          <Dialog>
                            {attachments.map((att, idx) => (
                              <DialogTrigger key={idx} asChild>
                                <div className="h-24 w-24 rounded-lg bg-muted border border-border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative">
                                  <ImageWithFallback
                                    key={att.path}
                                    src={att.path}
                                    alt={att.altText || `Attachment ${idx + 1}`}
                                    fill
                                    sizes="96px"
                                    className="object-cover"
                                  />
                                </div>
                              </DialogTrigger>
                            ))}
                            <DialogPortal>
                              <DialogOverlay className="bg-black/90 backdrop-blur-sm z-[100]" />
                              <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[100] grid w-[100vw] max-w-none -translate-x-1/2 -translate-y-1/2 gap-4 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 bg-transparent border-none shadow-none">
                                <DialogPrimitive.Close className="absolute right-6 top-6 z-[110] rounded-full bg-black/40 p-2.5 text-white/80 opacity-100 transition-all hover:bg-black/60 hover:text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50">
                                  <X className="h-6 w-6" />
                                  <span className="sr-only">Close</span>
                                </DialogPrimitive.Close>
                                <DialogTitle className="sr-only">Image Attachment Viewer</DialogTitle>
                                <Carousel className="w-[100vw] h-[100vh] flex items-center justify-center relative">
                                  <CarouselContent className="ml-0 h-full w-full">
                                    {attachments.map((att, idx) => (
                                      <CarouselItem key={idx} className="pl-0 flex items-center justify-center w-full h-full relative p-4">
                                        <div className="relative w-full h-[80vh] md:h-[90vh] flex items-center justify-center overflow-auto">
                                          <ImageWithFallback
                                            key={att.path}
                                            src={att.path}
                                            alt={att.altText || `Attachment ${idx + 1}`}
                                            fill
                                            priority={idx === 0}
                                            sizes="100vw"
                                            className="object-contain drop-shadow-2xl"
                                          />
                                        </div>
                                      </CarouselItem>
                                    ))}
                                  </CarouselContent>
                                  <CarouselPrevious className="left-8 absolute h-12 w-12 border-transparent bg-white/10 hover:bg-white/20 text-white" />
                                  <CarouselNext className="right-8 absolute h-12 w-12 border-transparent bg-white/10 hover:bg-white/20 text-white" />
                                </Carousel>
                              </DialogPrimitive.Content>
                            </DialogPortal>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column — Resolve Panel */}
                <div className="flex flex-col gap-3 lg:col-span-1 sticky top-8">
                  <h3 className="font-bold text-foreground">Resolve Dispute</h3>
                  <div className="border border-border rounded-xl p-5 bg-card shadow-sm flex flex-col gap-6">
                    {/* Status Selection */}
                    <div className="flex flex-col gap-4">
                      <span className="text-sm font-bold text-foreground">
                        Status Selection <span className="text-destructive">*</span>
                      </span>

                      <div className="flex items-center space-x-2 border border-border p-3 rounded-lg bg-muted/10">
                        <Checkbox
                          id="under-review"
                          checked={isUnderReview}
                          onCheckedChange={handleUnderReviewChange}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label htmlFor="under-review" className="text-sm font-semibold cursor-pointer">
                          Mark as Under Review
                        </Label>
                      </div>

                      <RadioGroup
                        value={resolutionStatus}
                        onValueChange={handleRadioChange}
                        className="flex flex-col gap-4"
                      >
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="resolved" id="resolved" className="mt-1 text-primary border-muted-foreground data-[state=checked]:border-primary" />
                          <div className="flex flex-col gap-1">
                            <Label htmlFor="resolved" className="font-bold cursor-pointer">
                              Resolved (Accepted)
                            </Label>
                            <span className="text-xs text-muted-foreground font-medium">
                              In favour of the complainant
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="rejected" id="rejected" className="mt-1 text-primary border-muted-foreground data-[state=checked]:border-primary" />
                          <div className="flex flex-col gap-1">
                            <Label htmlFor="rejected" className="font-bold cursor-pointer">
                              Rejected
                            </Label>
                            <span className="text-xs text-muted-foreground font-medium">
                              Closed in favour of the other party
                            </span>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Resolution Note */}
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-foreground">
                        Resolution Note <span className="text-destructive">*</span>
                      </span>
                      <Textarea
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                        placeholder="Enter details about the resolution..."
                        className="min-h-[160px] bg-background border-input resize-none focus-visible:ring-primary focus-visible:border-primary"
                        maxLength={1000}
                        disabled={isUnderReview}
                      />
                      <div className="flex justify-end">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Characters: {resolutionNote.length}/1000
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4">
                      <Button
                        variant="outline"
                        className="flex-1 font-bold bg-card hover:bg-muted h-11"
                        onClick={onClose}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 font-bold bg-primary text-primary-foreground hover:bg-primary/90 h-11"
                        onClick={handleConfirmResolution}
                        disabled={!canConfirm || isSubmitting}
                      >
                        {isSubmitting ? <Spinner size="sm" /> : "Confirm Resolution"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-12">Dispute details not found.</div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
