import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
export const useCartStore = create(persist((set, get) => ({
    items: [],

  addItem: (productId, quantity) => {
                set((state) => {
                    const existing = state.items.find((item) => item.productId === productId);
                    
                    if (existing) {
                        return {
                            items: state.items.map((item) =>
                                item.productId === productId
                                    ? { ...item, quantity: item.quantity + quantity }
                                    : item
                            ),
                        };
                    }
                    
                    return { items: [...state.items, { productId, quantity }] };
                });
            },


    reduceQuantity: (productId) => {
        const { items } = get();
        const targetItem = items.find((item) => item.productId === productId);

        if (!targetItem) return;

        if (targetItem.quantity <= 1) {
            // If it's 1, remove it completely from the cart
            set({ items: items.filter((item) => item.productId !== productId) });
        } else {
            // Otherwise, decrement normally
            set({
                items: items.map((item) =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                ),
            });
        }
    },
   increaseQuantity: (productId) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.productId === productId
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                }));
            },

    removeItem: (productId) =>
        set((state) => ({
            items: state.items.filter((item) => item.productId !== productId),
        })),

    clearItems: () => set({ items: [] })
}),
    {
        name: "Cart",
        storage: createJSONStorage(() => localStorage),

    }
));