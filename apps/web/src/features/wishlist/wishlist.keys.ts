export const wishlistKeys = {
  all: ["wishlist"] as const,
  detail: () => [...wishlistKeys.all, "detail"] as const,
};
