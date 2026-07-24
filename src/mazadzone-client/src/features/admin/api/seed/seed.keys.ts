export const seedKeys = {
  all: ["admin", "seed"] as const,
  stats: () => [...seedKeys.all, "stats"] as const,
};
