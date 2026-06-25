import { create } from 'zustand';

import type { Product } from '@/api/products';

type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
};

function loadCartItems() {
  if (typeof window === 'undefined') {
    return [] as CartItem[];
  }

  const raw = window.localStorage.getItem('nova-cart');

  if (!raw) {
    return [] as CartItem[];
  }

  try {
    const parsed = JSON.parse(raw) as { items?: CartItem[] };
    return Array.isArray(parsed.items) ? parsed.items : ([] as CartItem[]);
  } catch {
    return [] as CartItem[];
  }
}

function saveCartItems(items: CartItem[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem('nova-cart', JSON.stringify({ items }));
}

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCartItems(),
  addItem: (product, quantity = 1) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.product.id === product.id);
      const items = existingItem
        ? state.items.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
          )
        : [...state.items, { product, quantity }];

      saveCartItems(items);
      return { items };
    }),
  updateItemQuantity: (productId, quantity) =>
    set((state) => {
      const items = state.items
        .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0);

      saveCartItems(items);
      return { items };
    }),
  removeItem: (productId) =>
    set((state) => {
      const items = state.items.filter((item) => item.product.id !== productId);
      saveCartItems(items);
      return { items };
    }),
  clearCart: () => {
    saveCartItems([]);
    set({ items: [] });
  },
  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  getSubtotal: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
}));