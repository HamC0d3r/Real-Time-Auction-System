import { create } from "zustand";

// ─── Types ───────────────────────────────────────────────────────

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  /** Auto-dismiss duration in ms. Null = no auto-dismiss */
  duration: number | null;
}

interface NotificationState {
  notifications: Notification[];
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, "id">) => string;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

// ─── Store ───────────────────────────────────────────────────────

let notificationCounter = 0;

/**
 * Global notification/toast store.
 *
 * Not persisted — notifications are ephemeral and only exist
 * for the current session.
 */
export const useNotificationStore = create<NotificationStore>()((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = `notification-${++notificationCounter}`;
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    return id;
  },

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));
