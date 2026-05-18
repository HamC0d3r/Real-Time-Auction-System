"use client";

import { Check, Shield, Headphones, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BecomeSellerSidebar() {
  return (
    <div className="space-y-6">
      {/* Card 1: Seller Benefits */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-sm text-left">
        {/* Soft green award badge */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 mb-5 shadow-sm">
          <Award className="h-6 w-6" />
        </div>

        <h3 className="text-xl font-bold text-foreground mb-4">
          Seller Benefits
        </h3>

        <ul className="space-y-4">
          {[
            "List unlimited items for auction",
            "Reach thousands of active bidders",
            "Advanced analytics dashboard",
            "Priority customer support",
            "Secure payments and easy payouts",
            "Build your reputation with feedback"
          ].map((benefit, i) => (
            <li key={i} className="flex items-start gap-3 text-sm font-semibold text-muted-foreground">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 mt-0.5">
                <Check className="h-3.5 w-3.5 stroke-3" />
              </div>
              <span className="leading-tight pt-0.5">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Card 2: Safe & Secure with SVGs */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-sm text-left">
        {/* Soft blue shield badge */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 mb-5 shadow-sm">
          <Shield className="h-6 w-6" />
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2">
          Safe & Secure
        </h3>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6">
          Your payout and personal information are protected with bank-level security.
        </p>

        {/* Vector SVG Payment logos */}
        <div className="flex items-center gap-3.5 flex-wrap">
          {/* Visa Card Logo */}
          <div className="h-9 w-14 bg-slate-50 dark:bg-slate-900 border border-border rounded-lg flex items-center justify-center p-1 shadow-sm overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="h-7 w-auto">
              <g className="nc-icon-wrapper">
                <rect x="2" y="7" width="28" height="18" rx="3" ry="3" fill="#fff" strokeWidth="0"></rect>
                <path d="m27,7H5c-1.657,0-3,1.343-3,3v12c0,1.657,1.343,3,3,3h22c1.657,0,3-1.343,3-3v-12c0-1.657-1.343-3-3-3Zm2,15c0,1.103-.897,2-2,2H5c-1.103,0-2-.897-2-2v-12c0-1.103.897-2,2-2h22c1.103,0,2,.897,2,2v12Z" strokeWidth="0" opacity=".15"></path>
                <path d="m27,8H5c-1.105,0-2,.895-2,2v1c0-1.105.895-2,2-2h22c1.105,0,2,.895,2,2v-1c0-1.105-.895-2-2-2Z" fill="#fff" opacity=".2" strokeWidth="0"></path>
                <path d="m13.392,12.624l-2.838,6.77h-1.851l-1.397-5.403c-.085-.332-.158-.454-.416-.595-.421-.229-1.117-.443-1.728-.576l.041-.196h2.98c.38,0,.721.253.808.69l.738,3.918,1.822-4.608h1.84Z" fill="#1434cb" strokeWidth="0"></path>
                <path d="m20.646,17.183c.008-1.787-2.47-1.886-2.453-2.684.005-.243.237-.501.743-.567.251-.032.943-.058,1.727.303l.307-1.436c-.421-.152-.964-.299-1.638-.299-1.732,0-2.95.92-2.959,2.238-.011.975.87,1.518,1.533,1.843.683.332.912.545.909.841-.005.454-.545.655-1.047.663-.881.014-1.392-.238-1.799-.428l-.318,1.484c.41.188,1.165.351,1.947.359,1.841,0,3.044-.909,3.05-2.317" fill="#1434cb" strokeWidth="0"></path>
                <path d="m25.423,12.624h-1.494c-.337,0-.62.195-.746.496l-2.628,6.274h1.839l.365-1.011h2.247l.212,1.011h1.62l-1.415-6.77Zm-2.16,4.372l.922-2.542.53,2.542h-1.452Z" fill="#1434cb" strokeWidth="0"></path>
                <path fill="#1434cb" strokeWidth="0" d="M15.894 12.624L14.446 19.394 12.695 19.394 14.143 12.624 15.894 12.624z"></path>
              </g>
            </svg>
          </div>

          {/* Mastercard Logo */}
          <div className="h-9 w-14 bg-slate-50 dark:bg-slate-900 border border-border rounded-lg flex items-center justify-center p-1 shadow-sm">
            <svg viewBox="0 0 100 62" className="h-6 w-auto">
              <circle cx="34" cy="31" r="28" fill="#EB001B" />
              <circle cx="66" cy="31" r="28" fill="#F79E1B" opacity="0.85" />
              <path d="M50 8.6c-4.4 5.3-7 12.2-7 19.6s2.6 14.3 7 19.6c4.4-5.3 7-12.2 7-19.6s-2.6-14.3-7-19.6z" fill="#FF5F00" />
            </svg>
          </div>

          {/* Amex Logo */}
          <div className="h-9 w-14 bg-slate-50 dark:bg-slate-900 border border-border rounded-lg flex items-center justify-center p-1 shadow-sm">
            <svg viewBox="0 0 100 100" className="h-6 w-auto">
              <rect width="100" height="100" rx="10" fill="#007bc1" />
              <text x="50%" y="60%" textAnchor="middle" fill="#FFFFFF" fontSize="34" fontWeight="900" fontFamily="sans-serif">
                AMEX
              </text>
            </svg>
          </div>
        </div>
      </div>

    </div>
  );
}
