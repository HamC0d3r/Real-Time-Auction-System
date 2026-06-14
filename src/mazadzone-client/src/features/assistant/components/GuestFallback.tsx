"use client";

import React from "react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes.config";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

interface GuestFallbackProps {
  onClose: () => void;
}

export function GuestFallback({ onClose }: GuestFallbackProps) {
  const router = useRouter();

  return (
    <EmptyState
      icon={Lock}
      title="Sign in to chat"
      description="Mazad Assistant requires active user credentials to answer bidding questions and fetch real-time custom recommendations."
      action={
        <Button
          onClick={() => {
            onClose();
            router.push(ROUTES.AUTH.LOGIN);
          }}
          className="w-full"
        >
          Sign In to Your Account
        </Button>
      }
    />
  );
}
