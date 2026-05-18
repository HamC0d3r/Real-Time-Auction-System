"use client";

import Link from "next/link";
import { User, Mail, Phone, MapPin, IdCard, Info, Check } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/config/routes.config";

export function BecomeSellerAccountInfo() {
  const { user } = useAuthStore();

  // Dynamic values based on logged in user or fallback mock values
  const accountDetails = [
    {
      id: "name",
      label: "Full Name",
      value: user?.fullName || "Omar Ahmad",
      icon: <User className="h-5 w-5 text-muted-foreground shrink-0" />,
    },
    {
      id: "email",
      label: "Email Address",
      value: user?.email || "omar.ahmad@example.com",
      icon: <Mail className="h-5 w-5 text-muted-foreground shrink-0" />,
    },
    {
      id: "phone",
      label: "Phone Number",
      value: "07 1234 5678",
      icon: <Phone className="h-5 w-5 text-muted-foreground shrink-0" />,
    },
    {
      id: "address",
      label: "Address",
      value: (
        <div className="text-right">
          <p className="font-semibold text-foreground">Amman, Jordan</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Queen Rania St., Building 12
          </p>
        </div>
      ),
      icon: <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />,
    },
    {
      id: "nationalId",
      label: "National ID",
      value: "9821045678",
      icon: <IdCard className="h-5 w-5 text-muted-foreground shrink-0" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title block with Verified badge */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/40 pb-4">
        <h3 className="text-lg font-bold text-foreground tracking-tight">
          Your Account Information
        </h3>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
          <Check className="h-3.5 w-3.5 stroke-3" />
          Verified
        </div>
      </div>

      {/* Structured Read-only List Panel */}
      <div className="border border-border/80 rounded-2xl overflow-hidden bg-muted/10 divide-y divide-border/60">
        {accountDetails.map((detail) => (
          <div
            key={detail.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-6 gap-2 sm:gap-4 transition-colors hover:bg-muted/20"
          >
            {/* Left Cell: Icon & Label */}
            <div className="flex items-center gap-3 w-48 shrink-0">
              {detail.icon}
              <span className="text-sm font-semibold text-muted-foreground">
                {detail.label}
              </span>
            </div>

            {/* Right Cell: Value */}
            <div className="text-left sm:text-right font-semibold text-foreground text-sm sm:text-[15px] break-all">
              {typeof detail.value === "string" ? detail.value : detail.value}
            </div>
          </div>
        ))}
      </div>

      {/* Warn Banner */}
      <div className="flex items-start gap-3 bg-accent/20 border border-primary/10 rounded-xl p-4 text-xs md:text-sm text-amber-800 dark:text-amber-300">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          These details were provided during registration and cannot be edited here. You can update them from your{" "}
          <Link
            href={ROUTES.PROFILE.VIEW}
            className="text-primary hover:underline font-bold transition-all"
          >
            Profile Settings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
