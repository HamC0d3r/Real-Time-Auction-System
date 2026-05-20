import { api } from "@/lib/api/client";
import type { CreateDisputeInput, Dispute } from "../types/disputes.types";

const simulateDelay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const mockDisputes: Dispute[] = [];

/**
 * Files a new dispute for a given order.
 */
export async function fileDispute(input: CreateDisputeInput): Promise<Dispute> {
  await simulateDelay(400);

  /*
  // --- REAL API CALL (Uncomment when backend is ready) ---
  const response = await api.post<Dispute>("/disputes", input);
  return response.data;
  */

  const newDispute: Dispute = {
    id: `disp-${Math.random().toString(36).substring(2, 11)}`,
    orderId: input.orderId,
    title: input.title,
    description: input.description,
    status: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockDisputes.push(newDispute);
  return newDispute;
}
