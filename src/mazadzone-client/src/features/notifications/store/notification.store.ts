/**
 * notification.store.ts
 *
 * In-app notification center store for MazadZone.
 *
 * Responsibilities:
 *  - Holds the list of in-app notifications shown in the header bell
 *    (e.g. "You were outbid", "Auction won", "Payment failed").
 *  - Tracks unread count and read/unread status.
 *  - Provides actions for marking as read and clearing notifications.
 *  - Coordinates optimistic updates (SignalR) with server hydration
 *    via an internal `_optimisticPending` guard counter.
 *  - Shows toast notifications when new unread items arrive from server refetch.
 */

import { create } from "zustand";
import type { Notification } from "../types/notification.types";

interface NotificationState {
  /** All in-app notifications for the current user. */
  notifications: Notification[];
  /**
   * The authoritative unread count for the header badge.
   * Updated synchronously on SignalR events and mark-as-read actions.
   * Hydrated from the server via the header's useGetUnreadCount query.
   */
  unreadCount: number;
  /**
   * Internal guard counter.
   * Incremented when SignalR fires an optimistic update.
   * Checked (and decremented) by server-hydration useEffects to avoid
   * overwriting the fresh optimistic value with stale server data.
   */
  _optimisticPending: number;
  /** Whether the store has been hydrated at least once from the server. */
  _hydrated: boolean;
}

interface NotificationActions {
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  /** Replace the badge count with the authoritative server value. */
  setUnreadCount: (count: number) => void;
  /** Increment the badge count by 1 when a live notification arrives. */
  incrementUnreadCount: () => void;
  /** Decrement the badge count by 1 when a notification is marked as read. */
  decrementUnreadCount: () => void;
  /** Zero the badge count after marking all as read. */
  resetUnreadCount: () => void;
  /**
   * Signal that an optimistic update just happened.
   * Call this after addNotification + incrementUnreadCount from SignalR.
   */
  _markOptimistic: () => void;
  /**
   * Check and consume the optimistic guard.
   * Returns `true` if there was a pending optimistic update (caller should
   * skip server overwrite). Returns `false` if none pending (safe to hydrate).
   */
  _consumeOptimistic: () => boolean;
  /**
   * Optimistic-aware sync from server data.
   * - If optimistic pending → merges (preserves live items).
   * - Otherwise → replaces the notification list entirely.
   * - Detects NEW unread notifications and shows toasts for them.
   * - Does NOT update unreadCount (the header's useGetUnreadCount is the authority).
   */
  syncFromServer: (serverItems: Notification[]) => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  _optimisticPending: 0,
  _hydrated: false,

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) =>
    set((state) => {
      // Prevent duplicate notifications by ID
      if (state.notifications.some((n) => n.id === notification.id)) {
        return {};
      }
      return { notifications: [notification, ...state.notifications] };
    }),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [], unreadCount: 0, _optimisticPending: 0, _hydrated: false }),

  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),

  incrementUnreadCount: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  decrementUnreadCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  resetUnreadCount: () => set({ unreadCount: 0 }),

  _markOptimistic: () =>
    set((state) => ({ _optimisticPending: state._optimisticPending + 1 })),

  _consumeOptimistic: () => {
    const pending = get()._optimisticPending;
    if (pending > 0) {
      set({ _optimisticPending: pending - 1 });
      return true;
    }
    return false;
  },

  syncFromServer: (serverItems) => {
    const { _optimisticPending, notifications: existing } = get();

    if (_optimisticPending > 0) {
      // Merge: replace temporary random-ID items with server items if they match title and message,
      // otherwise append new server items.
      const updated = [...existing];
      
      for (const serverItem of serverItems) {
        const matchIndex = updated.findIndex(
          (n) =>
            n.id === serverItem.id ||
            (n.id.startsWith("0.") &&
              n.title === serverItem.title &&
              n.message === serverItem.message)
        );

        if (matchIndex !== -1) {
          updated[matchIndex] = serverItem;
        } else {
          updated.push(serverItem);
        }
      }

      // Sort by date descending
      updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      set({ notifications: updated });
    } else {
      // Replace the notification list.
      // Do NOT fire toasts here — live toasts are handled exclusively by the
      // SignalR hook (useRealtimeNotifications). Firing toasts here would cause
      // old notifications to re-appear whenever the query is invalidated by
      // auction events (BidPlaced, StatusChanged, AuctionCreated).
      set({ notifications: serverItems, _hydrated: true });
    }
  },
}));
