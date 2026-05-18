import { BecomeSellerPage } from "@/features/seller";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Seller | MazadZone",
  description: "Upgrade your account to start listing items on the MazadZone e-auction platform.",
};

export default function Page() {
  return <BecomeSellerPage />;
}
