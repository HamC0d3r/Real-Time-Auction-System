"use client";

import React from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Category } from "../../types/category.types";
import { CategoryIcon, getCategoryStyles } from "../../constants/category.constants";

interface CategoriesTableProps {
  categories: Category[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string) => void;
  onEditCategory: (category: Category) => void;
  onAddSubcategory: (categoryId: string) => void;
  onDeleteCategory: (id: string, name: string) => void;
}

export function CategoriesTable({
  categories,
  activeCategoryId,
  onSelectCategory,
  onEditCategory,
  onAddSubcategory,
  onDeleteCategory,
}: CategoriesTableProps) {
  return (
    <div className="xl:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/20 hover:bg-muted/20">
              <TableHead className="py-4 px-6 font-bold">Category</TableHead>
              <TableHead className="py-4 px-4 font-bold">Slug</TableHead>
              <TableHead className="py-4 px-4 font-bold">Subcategories</TableHead>
              <TableHead className="py-4 px-4 font-bold text-center">Auctions Count</TableHead>
              <TableHead className="py-4 px-4 font-bold text-center">Status</TableHead>
              <TableHead className="py-4 px-6 font-bold text-center pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border text-sm">
            {categories.length === 0 ? (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground font-semibold">
                  No categories found. Click &apos;Add Category&apos; to create one!
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => {
                const styles = getCategoryStyles(cat.iconName || "FolderOpen");
                const isSelected = activeCategoryId === cat.id;
                const subNames = cat.subcategories.map((s) => s.name).join(", ");

                return (
                  <TableRow
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={cn(
                      "hover:bg-muted/30 transition-colors cursor-pointer group/row border-0",
                      isSelected && "bg-accent/40 hover:bg-accent/50"
                    )}
                  >
                    {/* Name & Icon */}
                    <TableCell className="py-4 px-6 font-bold">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 border rounded-xl shrink-0 transition-transform group-hover/row:scale-[1.05]", styles.bg, styles.text, styles.border)}>
                          <CategoryIcon name={cat.iconName || "FolderOpen"} className="h-4.5 w-4.5" />
                        </div>
                        <span className="font-semibold text-foreground text-[14px]">
                          {cat.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Slug */}
                    <TableCell className="py-4 px-4 text-muted-foreground font-medium text-xs font-mono">
                      {cat.slug}
                    </TableCell>

                    {/* Subcategories */}
                    <TableCell className="py-4 px-4 text-muted-foreground max-w-[200px] truncate font-medium text-xs">
                      {subNames || <span className="italic text-muted-foreground/50">None</span>}
                    </TableCell>

                    {/* Auctions Count */}
                    <TableCell className="py-4 px-4 text-center font-bold text-foreground/80">
                      {cat.auctionsCount.toLocaleString()}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4 px-4 text-center">
                      <Badge
                        className={cn(
                          "font-bold text-[10px] uppercase tracking-wider rounded-md px-1.5 py-0.5 pointer-events-none select-none",
                          cat.isActive
                            ? "bg-success text-success-foreground border border-success"
                            : "bg-destructive/10 text-destructive border border-destructive/30"
                        )}
                        variant="outline"
                      >
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 px-6 pr-8" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onSelectCategory(cat.id)}
                          title="View Details"
                          className="text-muted-foreground hover:text-foreground rounded-lg h-7 w-7"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEditCategory(cat)}
                          title="Edit Category"
                          className="text-muted-foreground hover:text-foreground rounded-lg h-7 w-7"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onAddSubcategory(cat.id)}
                          title="Add Subcategory"
                          className="text-muted-foreground hover:text-foreground rounded-lg h-7 w-7"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDeleteCategory(cat.id, cat.name)}
                          title="Delete Category"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg h-7 w-7"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
