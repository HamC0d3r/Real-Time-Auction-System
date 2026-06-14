export const accessKeys = {
  all: ["admin", "access"] as const,
  list: (filters: unknown) => [...accessKeys.all, "list", filters] as const,
};
