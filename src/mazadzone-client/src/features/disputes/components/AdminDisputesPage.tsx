"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, ShieldAlert } from "lucide-react";
import { AdminDisputesFilters } from "./AdminDisputesFilters";
import { AdminDisputesTable } from "./AdminDisputesTable";
import { useGetAdminDisputes } from "../api/disputes.queries";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DisputeTypeDialog } from "./DisputeTypeDialog";
import { useAppToast } from "@/lib/toast/app-toast";
import {
  useGetDisputeTypes,
  useCreateDisputeType,
  useUpdateDisputeType,
  useDeleteDisputeType,
} from "../api/disputes.queries";

export function AdminDisputesPage() {
  const { searchParams, setFilters } = useUrlFilters<{
    search: string;
    status: string;
    categoryId: string;
    sortColumn: string;
    page: number;
    pageSize: number;
  }>();

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "All Statuses";
  const categoryId = searchParams.get("categoryId") || "All Categories";
  const sortColumn = searchParams.get("sortColumn") || "SubmittedDate";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  const { data: disputes = [], isLoading } = useGetAdminDisputes({
    search,
    status,
    categoryId: categoryId !== "All Categories" ? categoryId : undefined,
    sortColumn,
    page,
    pageSize,
  });

  // Remote state and CRUD mutations for dispute types
  const { data: disputeTypes = [], isLoading: isTypesLoading } = useGetDisputeTypes();
  const createMutation = useCreateDisputeType();
  const updateMutation = useUpdateDisputeType();
  const deleteMutation = useDeleteDisputeType();

  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<{ id?: string; name: string; description: string } | null>(null);
  const appToast = useAppToast();

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setFilters({ pageSize: newPageSize, page: 1 });
  };

  const handleAddTypeClick = () => {
    setEditingType(null);
    setIsTypeDialogOpen(true);
  };

  const handleEditTypeClick = (type: { id: string; name: string; description: string }) => {
    setEditingType(type);
    setIsTypeDialogOpen(true);
  };

  const handleSaveDisputeType = async (values: { id?: string; name: string; description: string }) => {
    try {
      if (values.id) {
        await updateMutation.mutateAsync({
          id: values.id,
          request: { name: values.name, description: values.description },
        });
        appToast.success("Dispute Type Updated", `The dispute type "${values.name}" has been successfully modified.`);
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          description: values.description,
        });
        appToast.success("Dispute Type Created", `The dispute type "${values.name}" has been successfully added.`);
      }
    } catch (error) {
      console.error("Save failed:", error);
      appToast.error("Action Failed", "Failed to save the dispute type classification.");
    }
  };

  const handleDeleteTypeClick = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the dispute type "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        appToast.success("Dispute Type Deleted", `The dispute type "${name}" has been removed.`);
      } catch (error) {
        console.error("Delete failed:", error);
        appToast.error("Action Failed", "Failed to delete the dispute type classification.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Header section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono uppercase">
          Resolve Disputes
        </h1>
        <p className="text-muted-foreground text-sm">
          Review and manage dispute cases across orders and auctions.
        </p>
      </div>

      {/* Filters section */}
      <AdminDisputesFilters
        search={search}
        setSearch={(val) => setFilters({ search: val, page: 1 })}
        status={status}
        setStatus={(val) => setFilters({ status: val, page: 1 })}
        categoryId={categoryId}
        setCategoryId={(val) => setFilters({ categoryId: val, page: 1 })}
        sortColumn={sortColumn}
        setSortColumn={(val) => setFilters({ sortColumn: val, page: 1 })}
      />

      {/* Table section */}
      <AdminDisputesTable
        data={disputes}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalPages={Math.ceil(disputes.length / pageSize) || 1}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Dispute Types Management Section */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 md:p-6 flex flex-col gap-6 shadow-xs mt-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-foreground">
                Manage Dispute Types
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure dispute classifications and standard reasons for administrative tracking.
              </p>
            </div>
          </div>
          <Button
            onClick={handleAddTypeClick}
            className="h-9 px-4 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer rounded-lg"
          >
            <Plus className="h-4 w-4" />
            Add Dispute Type
          </Button>
        </div>

        <div className="overflow-x-auto w-full rounded-xl border border-border">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-1/4 font-bold text-foreground">Type Name</TableHead>
                <TableHead className="w-3/5 font-bold text-foreground">Description</TableHead>
                <TableHead className="w-24 font-bold text-foreground text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isTypesLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    Loading dispute types...
                  </TableCell>
                </TableRow>
              ) : disputeTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    No dispute types found.
                  </TableCell>
                </TableRow>
              ) : (
                disputeTypes.map((type) => (
                  <TableRow key={type.id} className="hover:bg-muted/10">
                    <TableCell className="font-semibold text-foreground align-middle">
                      {type.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground align-middle leading-relaxed">
                      {type.description}
                    </TableCell>
                    <TableCell className="text-right pr-6 align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTypeClick(type)}
                          title="Update classification"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTypeClick(type.id, type.name)}
                          title="Delete classification"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dispute Type Form Dialog */}
      <DisputeTypeDialog
        isOpen={isTypeDialogOpen}
        onClose={() => setIsTypeDialogOpen(false)}
        onSave={handleSaveDisputeType}
        initialValues={editingType}
      />
    </div>
  );
}
