import type { HubConnection } from "@microsoft/signalr";
import {
  createHubConnection,
  startConnection,
  stopConnection,
} from "./connection-factory";

export interface OrderStatusChangedEvent {
  orderId: string;
  newStatus: string;
  updatedAt: string;
}

export interface OrderCreatedEvent {
  orderId: string;
  auctionId: string;
  finalBid: number;
}

export function createOrdersHubClient(accessTokenFactory?: () => string | Promise<string>) {
  const connection: HubConnection = createHubConnection("/orders", accessTokenFactory);

  return {
    connection,

    start: () => startConnection(connection),
    stop: () => stopConnection(connection),

    onOrderStatusChanged: (callback: (event: OrderStatusChangedEvent) => void) => {
      connection.on("OrderStatusChanged", callback);
      return () => connection.off("OrderStatusChanged", callback);
    },

    onOrderCreated: (callback: (event: OrderCreatedEvent) => void) => {
      connection.on("OrderCreated", callback);
      return () => connection.off("OrderCreated", callback);
    },
  };
}

export type OrdersHubClient = ReturnType<typeof createOrdersHubClient>;
