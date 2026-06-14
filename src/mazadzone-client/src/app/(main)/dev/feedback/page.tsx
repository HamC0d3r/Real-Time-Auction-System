"use client";

import { useState } from "react";
import {
  AlertCircle,
  Bell,
  Package,
  Gavel,
  Search,
  CheckCircle2,
  TriangleAlert,
  Info,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppAlert } from "@/components/feedback/app-alert";
import { EmptyState } from "@/components/feedback/empty-state";
import { SectionError } from "@/components/feedback/section-error";
import { FormErrorMessage } from "@/components/feedback/form-error-message";
import { ConfirmActionDialog } from "@/components/dialogs/confirm-action-dialog";
import { appToast } from "@/lib/toast/app-toast";

export default function DevFeedbackPage() {
  // Section Error testing state
  const [retryCount, setRetryCount] = useState(0);
  const [isSimulatingRetry, setIsSimulatingRetry] = useState(false);

  // Empty State testing state
  const [emptyIcon, setEmptyIcon] = useState<"bell" | "package" | "gavel" | "search">("search");
  const [emptyTitle, setEmptyTitle] = useState("No auctions found");
  const [emptyDesc] = useState("We couldn't find any active listings matching your filters.");
  const [showEmptyAction, setShowEmptyAction] = useState(true);

  // Confirm Dialog testing state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogVariant, setDialogVariant] = useState<"default" | "destructive">("default");
  const [dialogLoading, setDialogLoading] = useState(false);

  // Field validation testing state
  const [bidValue, setBidValue] = useState("");
  const [bidError, setBidError] = useState<string | undefined>(undefined);

  // Mock Icons Map
  const ICON_MAP = {
    bell: Bell,
    package: Package,
    gavel: Gavel,
    search: Search,
  };

  const handleSimulateRetry = () => {
    setIsSimulatingRetry(true);
    appToast.info("Simulating Reconnection...", "Checking server health endpoints.");
    setTimeout(() => {
      setIsSimulatingRetry(false);
      setRetryCount((prev) => prev + 1);
      appToast.success("Data Restored Successfully", `Reconnected to database. Fetched fresh records.`);
    }, 1500);
  };

  const handleConfirmAction = () => {
    setDialogLoading(true);
    setTimeout(() => {
      setDialogLoading(false);
      setDialogOpen(false);
      appToast.success("Action Executed Successfully", "The secure backend modification has been recorded.");
    }, 2000);
  };

  const handleBidChange = (val: string) => {
    setBidValue(val);
    const num = parseFloat(val);
    if (!val) {
      setBidError("Bid amount is required.");
    } else if (isNaN(num)) {
      setBidError("Bid amount must be a valid numeric number.");
    } else if (num < 150) {
      setBidError("Bid amount must be at least JD 150 (current highest is JD 145).");
    } else {
      setBidError(undefined);
    }
  };

  const triggerMockAxiosError = () => {
    const mockAxiosError = {
      response: {
        status: 400,
        data: {
          message: "Could not finalize bid placement.",
          errors: {
            amount: ["The bid amount exceeds your maximum authorized daily limit."],
          },
        },
      },
    };
    appToast.fromApiError(mockAxiosError, "Fallback parsing error.");
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:py-12 space-y-12">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Feedback & Errors Laboratory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Developer sandbox to test global HTTP error pages, inline alerts, empty states, toasts, and dialog variants.
          </p>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECTION 1: SECTION ERRORS */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">1. Full Section Errors (`SectionError`)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Renders full-page or full-section network connection failures with optional retry loops.
            </p>
          </div>
          
          <div className="border border-border rounded-xl p-4 bg-muted/20">
            <SectionError
              title="Connection Timeout Error"
              description={`The client failed to negotiate with http://localhost:5000/api/auctions (HTTP 504 Gateway Timeout). Retried ${retryCount} times.`}
              onRetry={handleSimulateRetry}
              className="my-0"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Simulate a retry button action inside components:</span>
            <Button
              size="sm"
              variant="outline"
              disabled={isSimulatingRetry}
              onClick={handleSimulateRetry}
              className="gap-2 cursor-pointer font-bold text-xs"
            >
              <RefreshCw className={`h-3 w-3 ${isSimulatingRetry ? "animate-spin" : ""}`} />
              Trigger Refresh
            </Button>
          </div>
        </div>

        {/* SECTION 2: EMPTY STATE CONFIGURATOR */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">2. Configurable Empty Panels (`EmptyState`)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Renders customizable empty states across search result grids, dashboard sections, and inbox queues.
            </p>
          </div>

          <div className="border border-border rounded-xl p-4 bg-muted/20">
            <EmptyState
              title={emptyTitle}
              description={emptyDesc}
              icon={ICON_MAP[emptyIcon]}
              action={showEmptyAction ? <Button size="sm" className="cursor-pointer font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">Create Listing</Button> : undefined}
              className="my-0 border-dashed"
            />
          </div>

          {/* Configurator Controls */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Select Icon</Label>
              <div className="flex gap-1.5 mt-1">
                {(["search", "bell", "package", "gavel"] as const).map((ic) => (
                  <Button
                    key={ic}
                    size="sm"
                    variant={emptyIcon === ic ? "default" : "outline"}
                    onClick={() => setEmptyIcon(ic)}
                    className="cursor-pointer capitalize text-xs h-7 px-2.5 font-medium"
                  >
                    {ic}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Action Button CTA</Label>
              <div className="flex gap-1.5 mt-1">
                <Button
                  size="sm"
                  variant={showEmptyAction ? "default" : "outline"}
                  onClick={() => setShowEmptyAction(true)}
                  className="cursor-pointer text-xs h-7 px-2.5 font-medium"
                >
                  Show CTA
                </Button>
                <Button
                  size="sm"
                  variant={!showEmptyAction ? "default" : "outline"}
                  onClick={() => setShowEmptyAction(false)}
                  className="cursor-pointer text-xs h-7 px-2.5 font-medium"
                >
                  Hide CTA
                </Button>
              </div>
            </div>

            <div className="col-span-2 space-y-1">
              <Label className="text-xs font-bold">Interactive Title</Label>
              <Input
                value={emptyTitle}
                onChange={(e) => setEmptyTitle(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: INLINE ALERT STATES */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm col-span-1 lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">3. Inline alerts (`AppAlert`)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Renders persistent inline notifications for forms, authentication guards, and payments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppAlert
              type="success"
              title="Identity Verification Confirmed"
              message="Your national verification has been approved. You are ready to bid on highly valued properties."
            />
            <AppAlert
              type="info"
              title="Auction Delivery Window Notice"
              message="Sellers have 3 business days to ship verified order parcels before shipping fees trigger."
            />
            <AppAlert
              type="warning"
              title="Low Active Wallet Balance Warning"
              message="Your virtual funds are below JD 100. Deposit funds to place bids on live listings."
              action={<Button size="xs" variant="outline" className="border-warning-foreground/20 hover:bg-warning-foreground/10 text-xs font-semibold shrink-0 cursor-pointer">Add Funds</Button>}
            />
            <AppAlert
              type="error"
              title="Auction Cancellation Prevented"
              message="This listing cannot be cancelled because competitive active bids have already been placed by other buyers."
            />
          </div>
        </div>

        {/* SECTION 4: TOAST CONTROLLER */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">4. Global Toasts (`appToast`)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Trigger Sonner toasts directly. Decoupled from hooks, callable even in raw network/Axios interceptors.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Button
              variant="outline"
              onClick={() => appToast.success("Bidding Approved", "Your offer has been submitted.")}
              className="gap-2 cursor-pointer font-bold justify-start"
            >
              <CheckCircle2 className="h-4 w-4 text-success-foreground" />
              Success Toast
            </Button>

            <Button
              variant="outline"
              onClick={() => appToast.info("Countdown Starting", "Bid closing in 5 minutes.")}
              className="gap-2 cursor-pointer font-bold justify-start"
            >
              <Info className="h-4 w-4 text-info-foreground" />
              Info Toast
            </Button>

            <Button
              variant="outline"
              onClick={() => appToast.warning("Connection Fluctuation", "Reconnecting to LiveBid feeds.")}
              className="gap-2 cursor-pointer font-bold justify-start"
            >
              <TriangleAlert className="h-4 w-4 text-warning-foreground" />
              Warning Toast
            </Button>

            <Button
              variant="outline"
              onClick={() => appToast.error("Transaction Error", "Direct bank verification rejected.")}
              className="gap-2 cursor-pointer font-bold justify-start"
            >
              <AlertCircle className="h-4 w-4 text-destructive" />
              Error Toast
            </Button>

            <Button
              variant="outline"
              onClick={triggerMockAxiosError}
              className="col-span-2 gap-2 cursor-pointer font-bold justify-center border-dashed"
            >
              Simulate Complex Axios API Error
            </Button>
          </div>
        </div>

        {/* SECTION 5: MODAL CONFIRMATIONS & FORM VALIDATION */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">5. Dialogs (`ConfirmActionDialog`) & Form Errors</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Test modal confirmations and small inline input form field validations.
            </p>
          </div>

          <div className="space-y-6">
            {/* Modal Triggers */}
            <div className="space-y-2">
              <Label className="text-xs font-bold block mb-1">ConfirmActionDialog Trigger Controls</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setDialogVariant("default");
                    setDialogOpen(true);
                  }}
                  className="cursor-pointer font-bold flex-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Test Default Dialog
                </Button>
                <Button
                  onClick={() => {
                    setDialogVariant("destructive");
                    setDialogOpen(true);
                  }}
                  variant="destructive"
                  className="cursor-pointer font-bold flex-1 text-xs"
                >
                  Test Destructive Dialog
                </Button>
              </div>
            </div>

            {/* Inline Input Field validation */}
            <div className="space-y-2 border-t border-border pt-4">
              <Label htmlFor="mock-bid" className="text-xs font-bold block mb-1">Inline Field Errors (`FormErrorMessage`)</Label>
              <div className="space-y-1">
                <Input
                  id="mock-bid"
                  placeholder="Enter Bid Amount (e.g. 150)"
                  value={bidValue}
                  onChange={(e) => handleBidChange(e.target.value)}
                  className={`h-9 text-sm ${bidError ? "border-destructive ring-destructive/20 focus-visible:ring-destructive" : ""}`}
                />
                <FormErrorMessage message={bidError} />
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug">
                Type anything below 150 or non-numeric digits to trigger form input error state.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* RENDER DYNAMIC CONFIRM DIALOG */}
      <ConfirmActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogVariant === "destructive" ? "Permanently close this auction listing?" : "Authorize bid payment?"}
        description={
          dialogVariant === "destructive"
            ? "This action cannot be undone. All active bidders will have their wallet holds released and receive notification alerts."
            : "This will reserve JD 150 inside your digital wallet holds. Funds will only clear if you win the bidding listing."
        }
        confirmLabel={dialogVariant === "destructive" ? "Close Listing" : "Authorize Hold"}
        variant={dialogVariant}
        isLoading={dialogLoading}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
