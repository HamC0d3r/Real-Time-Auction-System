import { api } from "@/lib/api/client";
import { generateUUID } from "@/utils/uuid.utils";
import type { ImageModelDto } from "@/features/auctions/api/auction.contracts";
import type { PaginatedResult } from "@/types/api.types";
import type { CreateDisputeInput, Dispute } from "../types/disputes.types";
import type {
  CreateDisputeTypeRequest,
  DisputeTypeDto,
  OpenDisputeRequest,
  AdminDisputesQueryParams,
  DisputeListItemDto,
  DisputeDetailsDto,
} from "./disputes.contracts";

interface UploadFilesResponse {
  urls: string[];
}

type UploadScope = "disputes";

async function uploadFiles(
  scope: UploadScope,
  entityId: string,
  files: File[],
): Promise<string[]> {
  if (files.length === 0) {
    return [];
  }

  const formData = new FormData();

  for (const file of files) {
    formData.append("images", file);
  }

  const response = await fetch(
    `/api/upload?scope=${encodeURIComponent(scope)}&entityId=${encodeURIComponent(entityId)}`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    throw new Error(errorBody?.error || "Failed to upload dispute evidence.");
  }

  const result = (await response.json()) as UploadFilesResponse;
  return result.urls;
}

async function cleanupUploadedFiles(
  scope: UploadScope,
  entityId: string,
): Promise<void> {
  await fetch(
    `/api/upload?scope=${encodeURIComponent(scope)}&entityId=${encodeURIComponent(entityId)}`,
    {
      method: "DELETE",
    },
  );
}



/**
 * Files a new dispute for a given order on the ASP.NET Core backend.
 */
export async function fileDispute(input: CreateDisputeInput): Promise<Dispute> {
  const uploadEntityId = `${input.orderId}-${generateUUID()}`;
  let uploadedImages: ImageModelDto[] = [];

  try {
    const uploadedUrls = await uploadFiles(
      "disputes",
      uploadEntityId,
      input.evidenceFiles ?? [],
    );

    uploadedImages = uploadedUrls.map((url, index) => ({
      path: url,
      altText:
        input.evidenceFiles?.[index]?.name || `Dispute evidence ${index + 1}`,
      isMain: index === 0,
    }));

    const request: OpenDisputeRequest = {
      orderId: input.orderId,
      disputeTypeId: input.disputeTypeId,
      title: input.title,
      description: input.description,
      images: uploadedImages.length > 0 ? uploadedImages : null,
    };

    const response = await api.post<string>(
      "/disputes",
      request,
    );

    return {
      id: response.data,
      orderId: input.orderId,
      title: input.title,
      description: input.description,
      status: "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (uploadedImages.length > 0) {
      await cleanupUploadedFiles("disputes", uploadEntityId).catch(() => undefined);
    }

    throw error;
  }
}

/**
 * Retrieves all configured dispute types in the system.
 */
export async function fetchDisputeTypes(): Promise<DisputeTypeDto[]> {
  const response = await api.get<DisputeTypeDto[]>("/dispute-types");
  return response.data;
}

/**
 * Creates a new dispute type configuration.
 */
export async function createDisputeTypeApi(request: CreateDisputeTypeRequest): Promise<void> {
  await api.post("/dispute-types", request);
}

/**
 * Updates an existing dispute type configuration.
 */
export async function updateDisputeTypeApi(id: string, request: CreateDisputeTypeRequest): Promise<void> {
  await api.put(`/dispute-types/${id}`, request);
}

/**
 * Soft deletes an existing dispute type configuration.
 */
export async function deleteDisputeTypeApi(id: string): Promise<void> {
  await api.delete(`/dispute-types/${id}`);
}

// ─── Admin Dispute Management ────────────────────────────────────────────────

/**
 * Fetches paginated list of disputes for admin review.
 * Endpoint: GET /api/v1/disputes
 */
export async function fetchAdminDisputesApi(
  params: AdminDisputesQueryParams,
): Promise<PaginatedResult<DisputeListItemDto>> {
  const response = await api.get<PaginatedResult<DisputeListItemDto>>("/disputes", { params });
  return response.data;
}

/**
 * Fetches full details for a single dispute.
 * Endpoint: GET /api/v1/disputes/{id}
 */
export async function fetchDisputeDetailsApi(id: string): Promise<DisputeDetailsDto> {
  const response = await api.get<DisputeDetailsDto>(`/disputes/${id}`);
  return response.data;
}

/**
 * Resolves a dispute as an admin (accepted or rejected).
 * Endpoint: POST /api/v1/disputes/{id}/resolve
 */
export async function resolveDisputeApi(id: string, resolution: string): Promise<void> {
  await api.post(`/disputes/${id}/resolve`, { resolution });
}

/**
 * Marks a dispute as Under Review.
 * Endpoint: POST /api/v1/disputes/{id}/under-review
 */
export async function markDisputeUnderReviewApi(id: string): Promise<void> {
  await api.post(`/disputes/${id}/under-review`);
}
