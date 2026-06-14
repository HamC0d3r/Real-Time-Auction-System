import { api } from "@/lib/api/client";
import type {
  Category,
  Subcategory,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateSubcategoryInput,
  UpdateSubcategoryInput,
} from "../../types/category.types";
import { getCategoryIconByName } from "../../constants/category.constants";
import { mapBackendCategoryTree } from "./category.mappers";
import type { BackendCategoryNode, BackendCategoryDetail } from "./category.contracts";

// --- persistent mock categories database in-memory for fallback resilient development ---
export let mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Tech and Electronics",
    slug: "tech-electronics",
    description: "Devices, gadgets, and consumer electronics.",
    iconName: "Monitor",
    isActive: true,
    auctionsCount: 1248,
    subcategories: [
      { id: "sub-1-1", name: "Phones", slug: "phones", isActive: true, parentCategoryId: "cat-1", auctionsCount: 654 },
      { id: "sub-1-2", name: "Laptops", slug: "laptops", isActive: true, parentCategoryId: "cat-1", auctionsCount: 412 },
      { id: "sub-1-3", name: "Cameras", slug: "cameras", isActive: true, parentCategoryId: "cat-1", auctionsCount: 120 },
      { id: "sub-1-4", name: "Accessories", slug: "accessories", isActive: true, parentCategoryId: "cat-1", auctionsCount: 62 },
    ],
  },
  {
    id: "cat-2",
    name: "Fashion and Style",
    slug: "fashion-style",
    description: "Trendy apparel, accessories, and shoes.",
    iconName: "Shirt",
    isActive: true,
    auctionsCount: 932,
    subcategories: [
      { id: "sub-2-1", name: "Men", slug: "men", isActive: true, parentCategoryId: "cat-2", auctionsCount: 450 },
      { id: "sub-2-2", name: "Women", slug: "women", isActive: true, parentCategoryId: "cat-2", auctionsCount: 382 },
      { id: "sub-2-3", name: "Shoes", slug: "shoes", isActive: true, parentCategoryId: "cat-2", auctionsCount: 100 },
    ],
  },
  {
    id: "cat-3",
    name: "Home and Living",
    slug: "home-living",
    description: "Household items, decorations, and utensils.",
    iconName: "Home",
    isActive: true,
    auctionsCount: 876,
    subcategories: [
      { id: "sub-3-1", name: "Furniture", slug: "furniture", isActive: true, parentCategoryId: "cat-3", auctionsCount: 420 },
      { id: "sub-3-2", name: "Kitchen", slug: "kitchen", isActive: true, parentCategoryId: "cat-3", auctionsCount: 310 },
      { id: "sub-3-3", name: "Decor", slug: "decor", isActive: true, parentCategoryId: "cat-3", auctionsCount: 146 },
    ],
  },
  {
    id: "cat-4",
    name: "Collectibles and Art",
    slug: "collectibles-art",
    description: "Rare coins, postage stamps, paintings, and drawings.",
    iconName: "Image",
    isActive: true,
    auctionsCount: 654,
    subcategories: [
      { id: "sub-4-1", name: "Coins", slug: "coins", isActive: true, parentCategoryId: "cat-4", auctionsCount: 312 },
      { id: "sub-4-2", name: "Stamps", slug: "stamps", isActive: true, parentCategoryId: "cat-4", auctionsCount: 142 },
      { id: "sub-4-3", name: "Art", slug: "art", isActive: true, parentCategoryId: "cat-4", auctionsCount: 200 },
    ],
  },
  {
    id: "cat-5",
    name: "Hobbies and Leisure",
    slug: "hobbies-leisure",
    description: "Equipment for hobbies, physical activities, and gaming.",
    iconName: "Bike",
    isActive: true,
    auctionsCount: 532,
    subcategories: [
      { id: "sub-5-1", name: "Sports", slug: "sports", isActive: true, parentCategoryId: "cat-5", auctionsCount: 210 },
      { id: "sub-5-2", name: "Outdoor", slug: "outdoor", isActive: true, parentCategoryId: "cat-5", auctionsCount: 182 },
      { id: "sub-5-3", name: "Gaming", slug: "gaming", isActive: true, parentCategoryId: "cat-5", auctionsCount: 140 },
    ],
  },
  {
    id: "cat-6",
    name: "Motors",
    slug: "motors",
    description: "Vehicles, spare parts, and engine components.",
    iconName: "Car",
    isActive: true,
    auctionsCount: 1023,
    subcategories: [
      { id: "sub-6-1", name: "Cars", slug: "cars", isActive: true, parentCategoryId: "cat-6", auctionsCount: 610 },
      { id: "sub-6-2", name: "Motorcycles", slug: "motorcycles", isActive: true, parentCategoryId: "cat-6", auctionsCount: 290 },
      { id: "sub-6-3", name: "Parts", slug: "parts", isActive: true, parentCategoryId: "cat-6", auctionsCount: 123 },
    ],
  },
];

export async function fetchCategoriesTree(): Promise<Category[]> {
  try {
    const response = await api.get<BackendCategoryNode[]>("/categories/tree");
    return mapBackendCategoryTree(response.data);
  } catch (error) {
    console.warn("Failed to fetch admin categories from backend, falling back to mock data:", error);
    return [...mockCategories];
  }
}

export async function fetchCategoryDetail(id: string): Promise<Category> {
  try {
    const response = await api.get<BackendCategoryDetail>(`/categories/${id}`);
    const data = response.data;
    const iconName = getCategoryIconByName(data.name);
    return {
      id: data.id,
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: data.description || "",
      iconName,
      isActive: true,
      auctionsCount: 0,
      subcategories: [],
    };
  } catch (error) {
    console.warn(`Failed to fetch category detail for ID ${id}, falling back to mock data:`, error);
    const category = mockCategories.find((c) => c.id === id);
    if (!category) {
      throw new Error("Category not found in mock database");
    }
    return { ...category };
  }
}

export async function createCategoryApi(newCategory: CreateCategoryInput): Promise<Category> {
  try {
    const response = await api.post<string>("/categories", {
      name: newCategory.name,
      description: newCategory.description || "",
      parentId: null,
    });

    const createdId = response.data;
    return {
      id: createdId,
      name: newCategory.name,
      slug: newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: newCategory.description,
      iconName: getCategoryIconByName(newCategory.name),
      isActive: true,
      auctionsCount: 0,
      subcategories: [],
    };
  } catch (error) {
    console.warn("Failed to create category on backend, falling back to mock database:", error);

    const created: Category = {
      id: `cat-${Date.now()}`,
      name: newCategory.name,
      slug: newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: newCategory.description,
      iconName: getCategoryIconByName(newCategory.name),
      isActive: newCategory.isActive,
      auctionsCount: 0,
      subcategories: [],
    };

    mockCategories = [created, ...mockCategories];
    return created;
  }
}

export async function updateCategoryApi(id: string, data: UpdateCategoryInput): Promise<Category> {
  try {
    await api.put<void>(`/categories/${id}`, {
      name: data.name,
      description: data.description || "",
    });

    return {
      id,
      name: data.name || "",
      slug: (data.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: data.description,
      iconName: getCategoryIconByName(data.name || ""),
      isActive: data.isActive !== undefined ? data.isActive : true,
      auctionsCount: 0,
      subcategories: [],
    };
  } catch (error) {
    console.warn(`Failed to update category ${id} on backend, falling back to mock database:`, error);

    const index = mockCategories.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("Category not found in mock database");
    }

    const updatedCategory: Category = {
      ...mockCategories[index],
      ...data,
      slug: data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : mockCategories[index].slug,
      iconName: data.name ? getCategoryIconByName(data.name) : mockCategories[index].iconName,
    };

    mockCategories = [
      ...mockCategories.slice(0, index),
      updatedCategory,
      ...mockCategories.slice(index + 1),
    ];

    return updatedCategory;
  }
}

export async function deleteCategoryApi(id: string): Promise<void> {
  try {
    await api.delete<void>(`/categories/${id}`);
  } catch (error) {
    console.warn(`Failed to delete category ${id} on backend, falling back to mock database:`, error);

    const index = mockCategories.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("Category not found in mock database");
    }

    mockCategories = [
      ...mockCategories.slice(0, index),
      ...mockCategories.slice(index + 1),
    ];
  }
}

export async function createSubcategoryApi(newSub: CreateSubcategoryInput): Promise<Subcategory> {
  try {
    const response = await api.post<string>("/categories", {
      name: newSub.name,
      description: newSub.description || "",
      parentId: newSub.parentCategoryId,
    });

    const createdId = response.data;
    return {
      id: createdId,
      name: newSub.name,
      slug: newSub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: newSub.description,
      isActive: true,
      parentCategoryId: newSub.parentCategoryId,
      auctionsCount: 0,
    };
  } catch (error) {
    console.warn("Failed to create subcategory on backend, falling back to mock database:", error);

    const parentCategory = mockCategories.find((c) => c.id === newSub.parentCategoryId);
    if (!parentCategory) {
      throw new Error("Parent category not found in mock database");
    }

    const created: Subcategory = {
      id: `sub-${Date.now()}`,
      name: newSub.name,
      slug: newSub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: newSub.description,
      isActive: newSub.isActive,
      parentCategoryId: newSub.parentCategoryId,
      auctionsCount: 0,
    };

    parentCategory.subcategories = [...parentCategory.subcategories, created];
    return created;
  }
}

export async function updateSubcategoryApi(id: string, data: UpdateSubcategoryInput): Promise<Subcategory> {
  try {
    await api.put<void>(`/categories/${id}`, {
      name: data.name,
      description: data.description || "",
    });

    return {
      id,
      name: data.name || "",
      slug: (data.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: data.description,
      isActive: data.isActive !== undefined ? data.isActive : true,
      parentCategoryId: "", // Will be merged from invalidation refetches
      auctionsCount: 0,
    };
  } catch (error) {
    console.warn(`Failed to update subcategory ${id} on backend, falling back to mock database:`, error);

    let foundSub: Subcategory | null = null;
    let parentCat: Category | null = null;

    for (const cat of mockCategories) {
      const sub = cat.subcategories.find((s) => s.id === id);
      if (sub) {
        foundSub = sub;
        parentCat = cat;
        break;
      }
    }

    if (!foundSub || !parentCat) {
      throw new Error("Subcategory not found in mock database");
    }

    const updatedSub: Subcategory = {
      ...foundSub,
      ...data,
      slug: data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : foundSub.slug,
    };

    parentCat.subcategories = parentCat.subcategories.map((s) => (s.id === id ? updatedSub : s));
    return updatedSub;
  }
}

export async function deleteSubcategoryApi(id: string, parentCategoryId: string): Promise<void> {
  try {
    await api.delete<void>(`/categories/${id}`);
  } catch (error) {
    console.warn(`Failed to delete subcategory ${id} on backend, falling back to mock database:`, error);

    const parentCategory = mockCategories.find((c) => c.id === parentCategoryId);
    if (!parentCategory) {
      throw new Error("Parent category not found in mock database");
    }

    parentCategory.subcategories = parentCategory.subcategories.filter((s) => s.id !== id);
  }
}
