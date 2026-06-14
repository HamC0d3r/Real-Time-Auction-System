import type { Category, Subcategory } from "../../types/category.types";
import { getCategoryIconByName } from "../../constants/category.constants";
import type { BackendCategoryNode } from "./category.contracts";

// Helper to map recursive backend CategoryTreeResponse objects into Category models
export function mapBackendCategoryTree(backendTree: BackendCategoryNode[]): Category[] {
  return backendTree.map((item) => {
    const iconName = getCategoryIconByName(item.name);
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const subcategories: Subcategory[] = (item.children || []).map((sub) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: sub.description || "",
      isActive: true, // Backend has soft-deleted state separate, default to active
      parentCategoryId: item.id,
      auctionsCount: 0, // Default auctions count for subcategories
    }));

    return {
      id: item.id,
      name: item.name,
      slug,
      description: item.description || "",
      iconName,
      isActive: true,
      auctionsCount: 0, // Default auctions count for main categories
      subcategories,
    };
  });
}
