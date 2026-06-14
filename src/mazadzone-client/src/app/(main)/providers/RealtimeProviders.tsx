"use client";

import { useRealtimeNotifications, useNotificationSync } from "@/features/notifications";
import { useRealtimeAuctions, useGetCategoryTree } from "@/features/auctions";
import { useRealtimeOrders } from "@/features/orders/hooks/useRealtimeOrders";
import { useAuthStore } from "@/stores/auth.store";
import dynamic from "next/dynamic";

const WinDialog = dynamic(
  () => import("@/features/notifications/components/WinDialog").then((m) => m.WinDialog),
  { ssr: false }
);
const ShippingDialog = dynamic(
  () => import("@/features/notifications/components/ShippingDialog").then((m) => m.ShippingDialog),
  { ssr: false }
);
const DeliveredDialog = dynamic(
  () => import("@/features/notifications/components/DeliveredDialog").then((m) => m.DeliveredDialog),
  { ssr: false }
);

export function RealtimeProviders() {
  const user = useAuthStore((state) => state.user);

  useRealtimeAuctions();
  useRealtimeOrders(user?.id);
  useRealtimeNotifications(user?.id);
  useNotificationSync();
  useGetCategoryTree();

  return (
    <>
      <WinDialog />
      <ShippingDialog />
      <DeliveredDialog />
    </>
  );
}