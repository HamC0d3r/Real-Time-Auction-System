export interface CreateDisputeInput {
  orderId: string;
  title: string;
  description: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  title: string;
  description: string;
  status: "Pending" | "Resolved" | "UnderReview";
  createdAt: string;
  updatedAt: string;
}
