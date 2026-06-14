"use client";

import { useState } from "react";
import { useAppToast } from "@/lib/toast/app-toast";
import { AppAlert } from "@/components/feedback/app-alert";
import { ConfirmActionDialog } from "@/components/dialogs/confirm-action-dialog";
import { useNotificationStore, type NotificationType } from "@/features/notifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  TriangleAlert,
  Info,
  Trash2,
  Ban,
  Gavel,
  ShieldX,
  CreditCard,
  Trophy,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-0.5">
        <h2 className="text-lg font-bold text-foreground tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Divider() {
  return <hr className="border-border" />;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NotificationsTestPage() {
  const toast = useAppToast();

  // Zustand Notification Store selectors
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const clearNotifications = useNotificationStore((state) => state.clearAll);

  const triggerMockSignalREvent = (
    type: "success" | "info" | "warning" | "error",
    title: string,
    message: string,
    entityType: "auction" | "bid" | "order" | "payment" | "dispute" | "feedback" | "account" | "system",
    href?: string
  ) => {
    // Map scenario combinations to a valid NotificationType
    let domainType: NotificationType = "general";
    if (entityType === "bid") {
      domainType = type === "success" ? "bid_placed" : "outbid";
    } else if (entityType === "auction") {
      domainType = "seller_approved";
    } else if (entityType === "payment") {
      domainType = "payment_failed";
    }

    const id = `mock-sig-${Date.now()}`;
    addNotification({
      id,
      type: domainType,
      title,
      message,
      link: href,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    toast.show(type, title, message);
  };

  // Alert visibility state
  const [alerts, setAlerts] = useState({
    success: false,
    error: false,
    warning: false,
    info: false,
    apiError: false,
  });

  const showAlert = (key: keyof typeof alerts) =>
    setAlerts((prev) => ({ ...prev, [key]: true }));
  const hideAlert = (key: keyof typeof alerts) =>
    setAlerts((prev) => ({ ...prev, [key]: false }));

  // Confirm dialog state
  const [dialog, setDialog] = useState<{
    open: boolean;
    scenario: string;
    title: string;
    description: string;
    confirmLabel: string;
    variant: "default" | "destructive";
    isLoading: boolean;
  }>({
    open: false,
    scenario: "",
    title: "",
    description: "",
    confirmLabel: "Confirm",
    variant: "default",
    isLoading: false,
  });

  const openDialog = (
    scenario: string,
    title: string,
    description: string,
    confirmLabel: string,
    variant: "default" | "destructive" = "default"
  ) =>
    setDialog({ open: true, scenario, title, description, confirmLabel, variant, isLoading: false });

  const handleConfirm = () => {
    setDialog((prev) => ({ ...prev, isLoading: true }));
    setTimeout(() => {
      setDialog((prev) => ({ ...prev, open: false, isLoading: false }));
      toast.success(`${dialog.scenario} confirmed`, "The action completed successfully.");
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">

        {/* ── Page header ── */}
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Notification System — Test Lab
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Interactive playground for all feedback components: toasts, inline alerts, and confirmation dialogs.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {["Sonner Toasts", "AppAlert", "ConfirmActionDialog", "API Error Parsing"].map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-medium">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <Divider />

        {/* ══════════════════════════════════════════
            1. SONNER TOASTS
        ══════════════════════════════════════════ */}
        <Section
          title="🔔 Sonner Toasts"
          description="Ephemeral feedback — auto-dismisses. Appears top-right."
        >
          {/* Basic types */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Basic types</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                onClick={() => toast.success("Bid placed!", "Your bid of JD 350 is now the highest.")}
                className="w-full gap-2 bg-success text-success-foreground hover:bg-success/80 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                Success
              </Button>
              <Button
                onClick={() => toast.error("Payment failed", "Your payment authorization was declined.")}
                className="w-full gap-2"
                variant="destructive"
              >
                <AlertCircle className="h-4 w-4" />
                Error
              </Button>
              <Button
                onClick={() => toast.warning("Auction ending soon", "Only 5 minutes remaining.")}
                className="w-full gap-2 bg-warning text-warning-foreground hover:bg-warning/80 cursor-pointer"
              >
                <TriangleAlert className="h-4 w-4" />
                Warning
              </Button>
              <Button
                onClick={() => toast.info("ID verification required", "Verify your National ID to place bids.")}
                className="w-full gap-2 bg-info text-info-foreground hover:bg-info/80 cursor-pointer"
              >
                <Info className="h-4 w-4" />
                Info
              </Button>
            </div>
          </div>

          {/* Real auction flow scenarios */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Auction flow scenarios</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start gap-2 cursor-pointer" onClick={() =>
                toast.success("Auction created", "Your listing is now live. Good luck!")
              }>
                <Trophy className="h-4 w-4 text-primary" />
                Auction Created
              </Button>
              <Button variant="outline" className="justify-start gap-2 cursor-pointer" onClick={() =>
                toast.warning("You've been outbid!", "A new bid of JD 425 was placed on Classic Watch.")
              }>
                <Gavel className="h-4 w-4 text-warning-foreground" />
                Outbid Alert
              </Button>
              <Button variant="outline" className="justify-start gap-2 cursor-pointer" onClick={() =>
                toast.success("You won the auction!", "Congratulations! You can now proceed to payment.")
              }>
                <Trophy className="h-4 w-4 text-success-foreground" />
                Auction Won
              </Button>
              <Button variant="outline" className="justify-start gap-2 cursor-pointer" onClick={() =>
                toast.error("Bid rejected", "Your bid was rejected because the payment authorization failed.")
              }>
                <CreditCard className="h-4 w-4 text-destructive" />
                Bid Rejected
              </Button>
              <Button variant="outline" className="justify-start gap-2 cursor-pointer" onClick={() =>
                toast.info("Order shipped", "Your item has been dispatched. Track your delivery.")
              }>
                <Package className="h-4 w-4 text-info-foreground" />
                Order Shipped
              </Button>
              <Button variant="outline" className="justify-start gap-2 cursor-pointer" onClick={() =>
                toast.success("Review submitted", "Your feedback for Ahmed Seller has been recorded.")
              }>
                <CheckCircle2 className="h-4 w-4 text-success-foreground" />
                Review Submitted
              </Button>
            </div>
          </div>

          {/* API error parsing */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              fromApiError() — API shape normalisation
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start gap-2 text-left h-auto py-3 cursor-pointer"
                onClick={() =>
                  toast.fromApiError(
                    { message: "This auction cannot be cancelled because bids have already been placed." },
                    "Fallback error"
                  )
                }
              >
                <span className="flex flex-col items-start gap-0.5">
                  <span className="font-semibold text-sm">&#123; message &#125;</span>
                  <span className="text-[11px] text-muted-foreground">plain message shape</span>
                </span>
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 text-left h-auto py-3 cursor-pointer"
                onClick={() =>
                  toast.fromApiError(
                    {
                      response: {
                        status: 422,
                        data: {
                          title: "Validation Error",
                          errors: {
                            bidAmount: ["Bid must be at least JD 50 above the current bid."],
                          },
                        },
                      },
                    },
                    "Fallback error"
                  )
                }
              >
                <span className="flex flex-col items-start gap-0.5">
                  <span className="font-semibold text-sm">&#123; errors: &#123; field &#125; &#125;</span>
                  <span className="text-[11px] text-muted-foreground">Axios 422 validation shape</span>
                </span>
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 text-left h-auto py-3 cursor-pointer"
                onClick={() =>
                  toast.fromApiError(
                    new Error("Network request failed"),
                    "Could not connect to the server."
                  )
                }
              >
                <span className="flex flex-col items-start gap-0.5">
                  <span className="font-semibold text-sm">new Error()</span>
                  <span className="text-[11px] text-muted-foreground">plain JS Error instance</span>
                </span>
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 text-left h-auto py-3 cursor-pointer"
                onClick={() =>
                  toast.fromApiError(null, "An unexpected error occurred. Please try again.")
                }
              >
                <span className="flex flex-col items-start gap-0.5">
                  <span className="font-semibold text-sm">null / unknown</span>
                  <span className="text-[11px] text-muted-foreground">falls back to default message</span>
                </span>
              </Button>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ══════════════════════════════════════════
            2. INLINE ALERTS
        ══════════════════════════════════════════ */}
        <Section
          title="📋 Inline Alerts (AppAlert)"
          description="Persistent inline messages the user must read before proceeding."
        >
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Toggle alerts</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["success", "error", "warning", "info"] as const).map((type) => (
                <Button
                  key={type}
                  variant={alerts[type] ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    alerts[type] ? hideAlert(type) : showAlert(type)
                  }
                  className={cn(
                    "cursor-pointer capitalize font-semibold",
                    alerts[type] && type === "success" && "bg-success text-success-foreground hover:bg-success/80",
                    alerts[type] && type === "error" && "bg-destructive text-destructive-foreground",
                    alerts[type] && type === "warning" && "bg-warning text-warning-foreground hover:bg-warning/80",
                    alerts[type] && type === "info" && "bg-info text-info-foreground hover:bg-info/80",
                  )}
                >
                  {alerts[type] ? "Hide" : "Show"} {type}
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              {alerts.success && (
                <AppAlert
                  type="success"
                  title="Auction created successfully!"
                  message="Your listing is now live. Bidders can start placing bids immediately."
                />
              )}
              {alerts.error && (
                <AppAlert
                  type="error"
                  title="Payment authorization failed"
                  message="Your National ID must be verified before placing bids. Please complete your verification."
                />
              )}
              {alerts.warning && (
                <AppAlert
                  type="warning"
                  title="Auction ending in 5 minutes"
                  message="You have been outbid. Place a new bid now to stay in the lead."
                />
              )}
              {alerts.info && (
                <AppAlert
                  type="info"
                  title="Seller verification required"
                  message="Activate your seller privileges to create auction listings on MazadZone."
                />
              )}
            </div>
          </div>

          {/* Without titles */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Without title (message only)</p>
            <AppAlert type="success" message="Your address has been saved." />
            <AppAlert type="error" message="This auction cannot be cancelled because bids have already been placed." />
            <AppAlert type="warning" message="Your session expires in 10 minutes." />
            <AppAlert type="info" message="Bid increments for this auction are a minimum of JD 25." />
          </div>

          {/* With action button */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">With action</p>
            <AppAlert
              type="warning"
              title="Identity not verified"
              message="Your National ID must be verified before placing bids."
              action={
                <Button size="sm" className="text-xs h-7 cursor-pointer">
                  Verify now
                </Button>
              }
            />
            <AppAlert
              type="error"
              title="Payment method required"
              message="Add a payment method to your account to start bidding."
              action={
                <Button size="sm" variant="outline" className="text-xs h-7 cursor-pointer">
                  Add card
                </Button>
              }
            />
          </div>
        </Section>

        <Divider />

        {/* ══════════════════════════════════════════
            3. CONFIRM ACTION DIALOGS
        ══════════════════════════════════════════ */}
        <Section
          title="⚠️ Confirmation Dialogs (ConfirmActionDialog)"
          description="For destructive, irreversible, or financially significant actions. Simulates a 1.8s loading state on confirm."
        >
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Destructive actions
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start gap-2 cursor-pointer border-destructive/30 text-destructive hover:bg-destructive/5"
                onClick={() =>
                  openDialog(
                    "Cancel Auction",
                    "Cancel this auction?",
                    "This action cannot be undone. All bidders will be notified and any authorization holds will be released.",
                    "Cancel Auction",
                    "destructive"
                  )
                }
              >
                <XCircleIcon />
                Cancel Auction
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 cursor-pointer border-destructive/30 text-destructive hover:bg-destructive/5"
                onClick={() =>
                  openDialog(
                    "Delete Address",
                    "Delete this address?",
                    "This address will be permanently removed from your account and cannot be recovered.",
                    "Delete",
                    "destructive"
                  )
                }
              >
                <Trash2 className="h-4 w-4" />
                Delete Address
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 cursor-pointer border-destructive/30 text-destructive hover:bg-destructive/5"
                onClick={() =>
                  openDialog(
                    "Ban User",
                    "Ban this user?",
                    "Banning a user is a permanent action. They will lose access to MazadZone and all their active auctions will be cancelled.",
                    "Ban User",
                    "destructive"
                  )
                }
              >
                <Ban className="h-4 w-4" />
                Admin: Ban User
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 cursor-pointer border-destructive/30 text-destructive hover:bg-destructive/5"
                onClick={() =>
                  openDialog(
                    "Force-End Auction",
                    "Force-end this auction?",
                    "Bidding will close immediately. The current highest bidder will be declared the winner. This action cannot be reversed.",
                    "Force End",
                    "destructive"
                  )
                }
              >
                <ShieldX className="h-4 w-4" />
                Admin: Force-End Auction
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Safe confirmations (default variant)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start gap-2 cursor-pointer"
                onClick={() =>
                  openDialog(
                    "Payment",
                    "Confirm won order payment?",
                    "You are about to authorize a payment of JD 750 for Classic Rolex Watch. This amount will be charged to your saved card ending in 4242.",
                    "Confirm Payment"
                  )
                }
              >
                <CreditCard className="h-4 w-4 text-primary" />
                Confirm Won Order Payment
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 cursor-pointer"
                onClick={() =>
                  openDialog(
                    "Dispute Resolution",
                    "Close this dispute?",
                    "Closing this dispute will mark it as resolved. Both parties will be notified. This decision is final.",
                    "Close Dispute"
                  )
                }
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Admin: Close Dispute
              </Button>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ══════════════════════════════════════════
            4. SIGNALR REAL-TIME NOTIFICATIONS MOCK
        ══════════════════════════════════════════ */}
        <Section
          title="⚡ SignalR Real-time Notifications & Store Sync"
          description="Simulate real-time backend/SignalR notification events. Added events instantly prepend to the header's notification popover."
        >
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-border">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Local UI Store State</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium">Loaded: <strong className="text-foreground">{notifications.length}</strong></span>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm font-medium">Unread count: <strong className="text-primary">{unreadCount}</strong></span>
                </div>
              </div>
              {notifications.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearNotifications} className="text-xs h-7 text-destructive border-destructive/20 hover:bg-destructive/5 cursor-pointer">
                  Clear Store
                </Button>
              )}
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground pt-1">Trigger Real-time Events</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start gap-2 cursor-pointer border-success/30 hover:bg-success/5"
                onClick={() =>
                  triggerMockSignalREvent(
                    "success",
                    "Outbid Reclaimed!",
                    "You placed a highest bid of JD 500 on Luxury Watch.",
                    "bid",
                    "/auctions/luxury-watch"
                  )
                }
              >
                <Gavel className="h-4 w-4 text-success-foreground" />
                Mock: Success Bid Event
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 cursor-pointer border-warning/30 hover:bg-warning/5"
                onClick={() =>
                  triggerMockSignalREvent(
                    "warning",
                    "Outbid Alert!",
                    "You have been outbid by user 'HamC0d3r' on Rolex Datejust.",
                    "bid",
                    "/auctions/rolex-datejust"
                  )
                }
              >
                <Gavel className="h-4 w-4 text-warning-foreground" />
                Mock: Warning Outbid Event
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 cursor-pointer border-info/30 hover:bg-info/5"
                onClick={() =>
                  triggerMockSignalREvent(
                    "info",
                    "Auction Approved",
                    "Your listing 'Vintage Camera' has been moderated and approved.",
                    "auction",
                    "/auctions/vintage-camera"
                  )
                }
              >
                <Trophy className="h-4 w-4 text-info-foreground" />
                Mock: Info Auction Event
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 cursor-pointer border-destructive/30 hover:bg-destructive/5"
                onClick={() =>
                  triggerMockSignalREvent(
                    "error",
                    "Payment Failed",
                    "Automatic billing failed for order #MZ-9082.",
                    "payment",
                    "/orders/MZ-9082"
                  )
                }
              >
                <CreditCard className="h-4 w-4 text-destructive" />
                Mock: Error Payment Event
              </Button>
            </div>
          </div>
        </Section>

      </div>

      {/* Global confirm dialog */}
      <ConfirmActionDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
        title={dialog.title}
        description={dialog.description}
        confirmLabel={dialog.confirmLabel}
        variant={dialog.variant}
        isLoading={dialog.isLoading}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

// tiny inline icon helper
function XCircleIcon() {
  return <AlertCircle className="h-4 w-4" />;
}
