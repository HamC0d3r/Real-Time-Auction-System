import { api, apiClient } from "@/lib/api/client";
import type {
  SellerAuctionsResponse,
  SellerDashboardQueryParams,
  SellerFinancialsResponse,
  SellerOrdersResponse,
} from "./seller-dashboard.contracts";

/**
 * Retrieve seller dashboard auctions.
 */
export async function getSellerDashboardAuctions(
  params?: SellerDashboardQueryParams,
): Promise<SellerAuctionsResponse> {
  const response = await api.get<SellerAuctionsResponse>("/seller-dashboard/auctions", {
    params,
  });
  return response.data;
}

/**
 * Retrieve seller dashboard orders.
 */
export async function getSellerDashboardOrders(
  params?: SellerDashboardQueryParams,
): Promise<SellerOrdersResponse> {
  const response = await api.get<SellerOrdersResponse>("/seller-dashboard/orders", {
    params,
  });
  return response.data;
}

/**
 * Retrieve seller dashboard financials.
 */
export async function getSellerDashboardFinancials(
  params?: SellerDashboardQueryParams,
): Promise<SellerFinancialsResponse> {
  const response = await api.get<SellerFinancialsResponse>("/seller-dashboard/financials", {
    params,
  });
  return response.data;
}

/**
 * Export seller dashboard data as a CSV blob.
 * Uses the raw axios client to obtain a blob response.
 */
export async function exportSellerDashboardData(
  type: string,
  params?: Partial<SellerDashboardQueryParams>,
): Promise<Blob> {
  const response = await apiClient.get("/api/v1/seller-dashboard/export", {
    params: { type, Page: 1, PageSize: 10000, ...params },
    responseType: "blob",
  });
  return response.data;
}

/**
 * Trigger a browser download for a CSV blob.
 */
export function downloadCsvFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

