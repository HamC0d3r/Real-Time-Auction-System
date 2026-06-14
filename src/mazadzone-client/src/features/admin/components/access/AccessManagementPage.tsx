"use client";

import React, { useState, useMemo } from "react";
import { 
  KeyRound, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  Mail, 
  Phone, 
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateAdminDialog } from "./CreateAdminDialog";
import { useAdminUsers } from "../../api";

export function AccessManagementPage() {
  const { data: admins = [], isLoading } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Client-side search filtering
  const filteredAdmins = useMemo(() => {
    if (!search.trim()) return admins;
    const term = search.toLowerCase();
    return admins.filter(
      (admin) =>
        admin.fullName.toLowerCase().includes(term) ||
        admin.email.toLowerCase().includes(term) ||
        admin.phoneNumber.includes(term)
    );
  }, [admins, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter((a) => a.status.toLowerCase() === "active").length;
    const suspendedOrBanned = total - active;

    return { total, active, suspendedOrBanned };
  }, [admins]);

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <KeyRound className="h-7 w-7 text-primary" />
              Access Management
            </h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage administrative credentials, audit system roles, and provision new administrators.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="sm:w-auto w-full font-bold px-4 py-2.5 h-11 text-xs cursor-pointer rounded-xl text-white flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground border-transparent"
        >
          <UserPlus className="h-4 w-4" />
          Add New Admin
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Administrators */}
        <div className="p-5 bg-card border border-border rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 text-primary rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Administrators
            </span>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1 rounded" />
            ) : (
              <span className="text-2xl font-bold text-foreground mt-0.5">
                {stats.total}
              </span>
            )}
          </div>
        </div>

        {/* Active Administrators */}
        <div className="p-5 bg-card border border-border rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Active Admins
            </span>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1 rounded" />
            ) : (
              <span className="text-2xl font-bold text-emerald-500 mt-0.5">
                {stats.active}
              </span>
            )}
          </div>
        </div>

        {/* Restricted/Suspended Admins */}
        <div className="p-5 bg-card border border-border rounded-2xl flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-xl">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Restricted / Offline
            </span>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1 rounded" />
            ) : (
              <span className="text-2xl font-bold text-amber-500 mt-0.5">
                {stats.suspendedOrBanned}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 bg-card border border-border rounded-2xl shadow-xs space-y-4">
        {/* Search Control */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-lg bg-input-background border-input focus:border-ring"
            />
          </div>
          <span className="text-xs font-bold text-muted-foreground select-none">
            Showing {filteredAdmins.length} of {admins.length} administrators
          </span>
        </div>

        {/* Table View */}
        <div className="border border-border rounded-xl overflow-hidden bg-card/50">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold text-foreground">Admin User</TableHead>
                <TableHead className="font-bold text-foreground">Contact Details</TableHead>
                <TableHead className="font-bold text-foreground">Joined Date</TableHead>
                <TableHead className="font-bold text-foreground">Role</TableHead>
                <TableHead className="font-bold text-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3.5 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3.5 w-28" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <KeyRound className="h-10 w-10 text-muted-foreground/30" />
                      <span className="font-semibold text-sm">No administrators found</span>
                      <span className="text-xs text-muted-foreground/80 max-w-xs leading-relaxed">
                        Try modifying your search or click the button above to add a new administrator.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmins.map((admin) => {
                  const initials = admin.fullName
                    ? admin.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2)
                    : "A";

                  return (
                    <TableRow key={admin.id} className="hover:bg-muted/10">
                      {/* Avatar & Name */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-bold text-xs select-none">
                            {initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground truncate">
                              {admin.fullName}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-semibold truncate uppercase">
                              ID: {admin.id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Email & Phone */}
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="text-foreground truncate">{admin.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{admin.phoneNumber}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Joined Date */}
                      <TableCell className="text-xs font-semibold text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {admin.joinedAt
                              ? format(new Date(admin.joinedAt), "MMM d, yyyy")
                              : "N/A"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Role badge */}
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-2 py-0.5 text-[10px]">
                          {admin.role}
                        </Badge>
                      </TableCell>

                      {/* Status badge */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold px-2.5 py-0.5 text-[10px]",
                            admin.status.toLowerCase() === "active"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          )}
                        >
                          {admin.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Creation Modal Dialog */}
      <CreateAdminDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
