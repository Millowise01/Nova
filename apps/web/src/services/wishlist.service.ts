import type { AddWishlistItemInput } from "@nova/validation";

import { getApiClient } from "./api";

export function getWishlist() {
  return getApiClient().wishlist.getWishlist();
}

export function addWishlistItem(input: AddWishlistItemInput) {
  return getApiClient().wishlist.addItem(input);
}

export function removeWishlistItem(itemId: string) {
  return getApiClient().wishlist.removeItem(itemId);
}
