export const disputeKeys = {
  all: ["disputes"] as const,
  mine: () => [...disputeKeys.all, "mine"] as const,
  details: () => [...disputeKeys.all, "detail"] as const,
  detail: (id: string) => [...disputeKeys.details(), id] as const,
};
