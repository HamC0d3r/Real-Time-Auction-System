/**
 * Public API for the notifications feature.
 *
 * Import from here, not from internal paths:
 *   import { NotificationsPage } from '@/features/notifications';
 */

// -- Components --
export { NotificationPopover } from "./components/NotificationPopover";
export { NotificationsPage } from "./components/NotificationsPage";
export { WinDialog } from "./components/WinDialog";
export { ShippingDialog } from "./components/ShippingDialog";
export { DeliveredDialog } from "./components/DeliveredDialog";

// -- Hooks --
export { useRealtimeNotifications } from "./hooks/useRealtimeNotifications";
export { useNotificationSync } from "./hooks/useNotificationSync";

// -- Store --
export { useNotificationStore } from "./store/notification.store";
export { useWinDialogStore, triggerWinDialogFromNotification } from "./store/win-dialog.store";
export { useShippingDialogStore, triggerShippingDialogFromNotification } from "./store/shipping-dialog.store";
export { useDeliveredDialogStore, triggerDeliveredDialogFromNotification } from "./store/delivered-dialog.store";

// -- API --
export * from "./api";

// -- Types --
export type { Notification, NotificationType, NotificationResponse } from "./types/notification.types";
