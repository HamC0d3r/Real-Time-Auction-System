export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface OrderActivity {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryStatus: string;
  finalBid: number;
  date: string;
  auction: {
    id: string;
    title: string;
    imageUrl: string;
  };
}
