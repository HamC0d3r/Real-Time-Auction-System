/** Backend category tree node from GET /categories/tree */
export interface BackendCategoryNode {
  id: string;
  name: string;
  description?: string;
  children?: BackendCategoryNode[];
}

/** Backend category detail from GET /categories/{id} */
export interface BackendCategoryDetail {
  id: string;
  name: string;
  description?: string;
}
