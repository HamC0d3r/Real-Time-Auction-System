export const usersKeys = {
  all: ["admin", "moderate-users"] as const,
  list: (filters: unknown) => [...usersKeys.all, filters] as const,
};
