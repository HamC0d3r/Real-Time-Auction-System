import { OrderActivity } from "../types/orders.types";

export const MOCK_ORDERS: OrderActivity[] = [
  {
    id: "ord-1",
    orderNumber: "MZ-84920-X",
    status: "Pending",
    deliveryStatus: "Awaiting payment completion",
    finalBid: 1250,
    date: "2026-05-18T10:30:00Z",
    auction: {
      id: "auc-1",
      title: "Vintage Rolex Submariner (1978)",
      imageUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    id: "ord-2",
    orderNumber: "MZ-10294-A",
    status: "Shipped",
    deliveryStatus: "In transit - Carrier: Aramex",
    finalBid: 420,
    date: "2026-05-15T14:15:00Z",
    auction: {
      id: "auc-2",
      title: "PlayStation 5 Console (Special Edition)",
      imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    id: "ord-3",
    orderNumber: "MZ-58291-Q",
    status: "Delivered",
    deliveryStatus: "Signed by buyer at 12:44 PM",
    finalBid: 85,
    date: "2026-05-10T09:00:00Z",
    auction: {
      id: "auc-3",
      title: "Handmade Premium Leather Wallet",
      imageUrl: "https://images.unsplash.com/photo-1627124118303-68d18915da86?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    id: "ord-4",
    orderNumber: "MZ-42930-B",
    status: "Delivered",
    deliveryStatus: "Delivered to reception",
    finalBid: 1500,
    date: "2026-05-08T11:00:00Z",
    auction: {
      id: "auc-4",
      title: "High-End Gaming PC Build",
      imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    id: "ord-5",
    orderNumber: "MZ-39401-Z",
    status: "Cancelled",
    deliveryStatus: "Refunded - Dispute resolved",
    finalBid: 320,
    date: "2026-05-05T16:20:00Z",
    auction: {
      id: "auc-5",
      title: "Mechanical Keyboard Custom Brass Edition",
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    id: "ord-6",
    orderNumber: "MZ-90312-C",
    status: "Pending",
    deliveryStatus: "Processing checkout",
    finalBid: 110,
    date: "2026-05-01T13:40:00Z",
    auction: {
      id: "auc-6",
      title: "Vintage Denim Jacket 90s Edition",
      imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80",
    },
  },
];

/**
 * Returns mock won orders list for testing.
 */
export function getMockOrders(): OrderActivity[] {
  return MOCK_ORDERS;
}
