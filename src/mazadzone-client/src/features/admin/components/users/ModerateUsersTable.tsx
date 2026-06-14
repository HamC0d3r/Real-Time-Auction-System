"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MoreHorizontal, ArrowUpDown, Ban, PauseCircle, CheckCircle2, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ModerateUser } from "../../types/admin.types";
import {
  MODERATE_USER_COLUMNS,
  DROPDOWN_ITEMS
} from "../../constants/moderate-users.constants";
import { ModerateUsersPagination } from "./ModerateUsersPagination";
import { useRestoreUser } from "../../api";

import { SuspendUserDialog } from "./SuspendUserDialog";
import { BanUserDialog } from "./BanUserDialog";

interface UserAvatarImageProps {
  src?: string;
  alt: string;
  fallbackInitials: string;
}

function UserAvatarImage({ src, alt, fallbackInitials }: UserAvatarImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <span className="text-xs font-bold text-primary">
        {fallbackInitials}
      </span>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="36px"
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

interface ModerateUsersTableProps {
  users: ModerateUser[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
}

export function ModerateUsersTable({
  users,
  isLoading,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  selectedIds,
  onSelectAll,
  onSelectRow
}: ModerateUsersTableProps) {
  const router = useRouter();
  const [actionUser, setActionUser] = useState<ModerateUser | null>(null);
  const [actionType, setActionType] = useState<"suspend" | "ban" | null>(null);

  const restoreMutation = useRestoreUser();

  const handleActionClick = (type: "view" | "suspend" | "ban" | "restore", user: ModerateUser) => {
    if (type === "suspend" || type === "ban") {
      setActionUser(user);
      setActionType(type);
    } else if (type === "restore") {
      restoreMutation.mutate(user.id);
    } else if (type === "view") {
      router.push(`/users/${user.id}`);
    }
  };

  const isAllSelected = users.length > 0 && selectedIds.length === users.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < users.length;


  // Helper to generate dynamic action buttons based on user status
  const getActionButtons = (user: ModerateUser) => {
    const actions = [];

    // View is always present
    actions.push({
      label: "View",
      icon: Eye,
      variant: "default" as const,
      className: "bg-primary/10 text-primary hover:bg-primary/20 shadow-none border-transparent w-[70px]",
      type: "view" as const,
    });

    if (user.status === "Banned") {
      actions.push({
        label: "Restore User",
        icon: CheckCircle2,
        variant: "outline" as const,
        className: "text-success-foreground border-success bg-success hover:bg-success/20 shadow-none w-[146px]",
        type: "restore" as const,
      });
    } else {
      if (user.status === "Suspended") {
        actions.push({
          label: "Restore",
          icon: CheckCircle2,
          variant: "outline" as const,
          className: "text-success-foreground border-success bg-success hover:bg-success/20 shadow-none w-[70px]",
          type: "restore" as const,
        });
      } else {
        actions.push({
          label: "Suspend",
          icon: PauseCircle,
          variant: "outline" as const,
          className: "text-muted-foreground border-border bg-muted/30 hover:bg-muted/50 shadow-none w-[70px]",
          type: "suspend" as const,
        });
      }

      actions.push({
        label: "Ban",
        icon: Ban,
        variant: "outline" as const,
        className: "text-destructive border-destructive/20 bg-destructive/10 hover:bg-destructive/20 shadow-none w-[70px]",
        type: "ban" as const,
      });
    }

    return actions;
  };



  return (
    <div className="bg-card border border-border rounded-xl flex flex-col w-full overflow-hidden shadow-xs">
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-b-border">
              <TableHead className="w-12 text-center pl-4">
                <Checkbox
                  className="rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-primary"
                  checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                  onCheckedChange={(checked) => onSelectAll(checked as boolean)}
                />
              </TableHead>
              {MODERATE_USER_COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "text-xs font-bold text-muted-foreground uppercase tracking-wider",
                    col.align === "right" && "text-right pr-12",
                    col.align === "center" && "text-center"
                  )}
                >
                  {col.sortable ? (
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground">
                      {col.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/10 border-b-border group align-middle">
                  <TableCell className="w-12 text-center pl-4">
                    <Checkbox
                      className="rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-primary"
                      checked={selectedIds.includes(user.id)}
                      onCheckedChange={(checked) => onSelectRow(user.id, checked as boolean)}
                    />
                  </TableCell>

                  {/* User Avatar + Name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 relative">
                        <UserAvatarImage
                          key={user.avatarUrl}
                          src={user.avatarUrl}
                          alt={user.fullName}
                          fallbackInitials={user.fullName.substring(0, 2).toUpperCase()}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                        {user.fullName}
                      </span>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <span className="text-[13px] text-muted-foreground whitespace-nowrap">
                      {user.email}
                    </span>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-md px-2.5 py-0.5 text-[11px] font-semibold tracking-wide border-transparent",
                        user.role === "Bidder" && "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                        user.role === "Seller" && "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
                        user.role === "Admin" && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      )}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>

                  {/* Account Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-md px-2.5 min-w-26 py-0.5 text-[11px] font-semibold tracking-wide",
                        user.status === "Active" && "bg-success text-success-foreground border-success",
                        user.status === "Suspended" && "bg-[#FDF8B7] text-[#937D04] border-[#FDF8B7]",
                        user.status === "Banned" && "bg-destructive/10 text-destructive border-destructive/20"
                      )}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>

                  {/* Joined Date */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-foreground whitespace-nowrap">
                        {format(new Date(user.joinedDate), "MMM d, yyyy")}
                      </span>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {format(new Date(user.joinedDate), "h:mm a")}
                      </span>
                    </div>
                  </TableCell>

                  {/* Last Active */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-foreground whitespace-nowrap">
                        {user.lastActive.split(' ').slice(0, -2).join(' ') || user.lastActive.split(' ')[0]}
                      </span>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {user.lastActive.split(' ').slice(-2).join(' ')}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions - Always Visible */}
                  <TableCell className="text-center py-2 align-middle">
                    <div className="flex items-center justify-center gap-1.5 opacity-100 transition-opacity">
                      {getActionButtons(user).map((action, idx) => {
                        const Icon = action.icon;
                        const isRestoringThisUser =
                          action.type === "restore" &&
                          restoreMutation.isPending &&
                          restoreMutation.variables === user.id;

                        return (
                          <Button
                            key={idx}
                            variant={action.variant}
                            disabled={isRestoringThisUser}
                            onClick={() => handleActionClick(action.type, user)}
                            className={cn(
                              "flex flex-col items-center justify-center gap-1 h-[52px] px-2 shadow-none rounded-lg shrink-0 cursor-pointer",
                              action.className
                            )}
                          >
                            {isRestoringThisUser ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                            <span className={cn(
                              "leading-none",
                              action.label === "Restore User" ? "text-[11px] font-bold" : "text-[10px] font-semibold"
                            )}>
                              {isRestoringThisUser ? "Restoring..." : action.label}
                            </span>
                          </Button>
                        );
                      })}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-[52px] w-8 rounded-lg text-muted-foreground hover:bg-muted/50 shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32 bg-card text-foreground border-border" sideOffset={5}>
                          {DROPDOWN_ITEMS.map((item, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              className={cn("text-xs cursor-pointer", item.className)}
                            >
                              {item.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <ModerateUsersPagination
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      {/* Suspend Action Dialog */}
      <SuspendUserDialog
        isOpen={actionUser !== null && actionType === "suspend"}
        onClose={() => {
          setActionUser(null);
          setActionType(null);
        }}
        user={actionUser}
      />

      {/* Ban Action Dialog */}
      <BanUserDialog
        isOpen={actionUser !== null && actionType === "ban"}
        onClose={() => {
          setActionUser(null);
          setActionType(null);
        }}
        user={actionUser}
      />
    </div>
  );
}
