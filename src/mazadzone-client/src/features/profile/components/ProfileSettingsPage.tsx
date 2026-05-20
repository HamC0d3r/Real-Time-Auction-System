"use client";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountInfoForm } from "./AccountInfoForm";
import { AddressBook } from "./AddressBook";
import { ProfileSettingsSkeleton } from "./ProfileSettingsSkeleton";
import { useGetProfile } from "../api/profile.queries";

export function ProfileSettingsPage() {
  const { data: profile, isLoading, isError, refetch } = useGetProfile();

  if (isError) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
          <p className="text-lg font-semibold text-destructive">
            Failed to load profile settings
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            There was a connection issue loading your profile details. Please try again.
          </p>
          <Button
            type="button"
            onClick={() => void refetch()}
            className="px-5 py-2.5 text-sm font-semibold cursor-pointer h-auto"
          >
            Try Again
          </Button>
        </div>
      </PageWrapper>
    );
  }

  if (isLoading || !profile) {
    return <ProfileSettingsSkeleton />;
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account details and delivery addresses.
          </p>
        </div>

        {/* Account Info Card */}
        <AccountInfoForm profile={profile} />

        {/* Address Book Card */}
        <AddressBook />
      </div>
    </PageWrapper>
  );
}
