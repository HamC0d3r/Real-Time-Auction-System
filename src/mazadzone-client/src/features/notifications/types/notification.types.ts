export type NotificationType = 'bid_accepted' | 'order_shipped' | 'new_message' | 'auction_ending' | 'general';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  isRead: boolean;
  link?: string;
}

export interface NotificationResponse {
  items: Notification[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
}
