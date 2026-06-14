import { Info } from "lucide-react";
import type { PublicUserProfile } from "../../types/user-profile.types";
import { PublicUserStats } from "./PublicUserStats";

interface PublicActivitySectionProps {
  profile: PublicUserProfile;
}

export function PublicActivitySection({ profile }: PublicActivitySectionProps) {
  const isSeller = profile.roles.includes("Seller");

  if (!isSeller) {
    return (
      <div className="flex flex-col gap-6">
        {/* Public Activity Card Grid */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-foreground">
            Public Bidding Activity
          </h2>
          <PublicUserStats profile={profile} />
        </div>

        {/* Empty Seller Activity State */}
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Info className="size-6 shrink-0" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">
            No Seller Activity Yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            This user has not listed any items or received seller reviews yet. They participate on MazadZone as a bidder.
          </p>
        </div>
      </div>
    );
  }

  // If user is Seller + Bidder, we display this secondary participation section
  return (
    <div className="flex flex-col gap-4 mt-6">
      <div>
        <h2 className="text-base font-bold text-foreground">
          Bidder Participation Summary
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          This user also actively participates in the marketplace as a bidder.
        </p>
      </div>
      <PublicUserStats profile={profile} isCompact={true} />
    </div>
  );
}
